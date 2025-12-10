import { useRef, useState, useEffect, useCallback } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Loader2 } from "lucide-react";
import type { DrawingPayload } from "@shared/schema";

interface DrawingCanvasProps {
  onSubmit: (payload: DrawingPayload) => void;
  isProcessing: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
}

export default function DrawingCanvas({ 
  onSubmit, 
  isProcessing, 
  isConnected,
  isReconnecting 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasSize = useCallback(() => {
    if (!containerRef.current) return { width: 400, height: 400 };
    const containerWidth = containerRef.current.clientWidth - 48;
    const containerHeight = containerRef.current.clientHeight - 200;
    const size = Math.min(containerWidth, containerHeight, 600);
    return { width: size, height: size };
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = getCanvasSize();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
    }
  }, [getCanvasSize]);

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setHasDrawn(true);
    lastPointRef.current = coords;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords || !lastPointRef.current) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }

    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      const { width, height } = getCanvasSize();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }
    setHasDrawn(false);
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // First create a 280x280 version for display
    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = 280;
    displayCanvas.height = 280;
    const displayCtx = displayCanvas.getContext("2d");
    
    if (!displayCtx) return;
    
    displayCtx.fillStyle = "#FFFFFF";
    displayCtx.fillRect(0, 0, 280, 280);
    displayCtx.drawImage(canvas, 0, 0, 280, 280);
    const displayImage = displayCanvas.toDataURL("image/png");

    // Now create 28x28 grayscale version for model inference
    const modelCanvas = document.createElement("canvas");
    modelCanvas.width = 28;
    modelCanvas.height = 28;
    const modelCtx = modelCanvas.getContext("2d");
    
    if (!modelCtx) return;
    
    // Draw white background
    modelCtx.fillStyle = "#FFFFFF";
    modelCtx.fillRect(0, 0, 28, 28);
    
    // Draw scaled-down image
    modelCtx.drawImage(canvas, 0, 0, 28, 28);
    
    // Get image data and convert to grayscale normalized values
    const imageData = modelCtx.getImageData(0, 0, 28, 28);
    const grayscaleData: number[] = [];
    let hasInvalidValue = false;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      // Convert to grayscale (inverted: white=0, black=1 for typical ML models)
      const gray = (r + g + b) / 3;
      // Normalize to 0-1 range
      let normalized = 1 - (gray / 255);
      
      // Validate the value is finite and in range
      if (!Number.isFinite(normalized) || Number.isNaN(normalized)) {
        normalized = 0;
        hasInvalidValue = true;
      }
      
      // Strict clamp to exactly [0, 1] with rounding to avoid floating point drift
      normalized = Math.round(Math.max(0, Math.min(1, normalized)) * 1000) / 1000;
      grayscaleData.push(normalized);
    }

    // Validate array length before submitting
    if (grayscaleData.length !== 784) {
      console.error("Invalid grayscale data length:", grayscaleData.length);
      return;
    }

    // Final validation: ensure all values are valid numbers in [0, 1]
    const allValid = grayscaleData.every(v => 
      Number.isFinite(v) && v >= 0 && v <= 1
    );
    
    if (!allValid) {
      console.error("Grayscale data contains invalid values");
      return;
    }

    // Send both display image and model-ready data as structured object
    onSubmit({
      displayImage,
      modelData: grayscaleData,
      width: 28,
      height: 28,
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col" ref={containerRef}>
      <ParticleBackground />
      
      {(isProcessing || isReconnecting) && (
        <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
          <p className="text-2xl font-medium text-gray-700">
            {isReconnecting ? "Connecting..." : "AI is analyzing your drawing..."}
          </p>
        </div>
      )}

      <div className="flex-none p-6 text-center">
        <h2 
          className="text-2xl md:text-3xl font-medium text-gray-800"
          data-testid="text-drawing-prompt"
        >
          Draw any object - cat, tree, house, car...
        </h2>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-500">
          Use your finger or stylus to draw
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <canvas
          ref={canvasRef}
          className="bg-white rounded-2xl shadow-lg touch-none cursor-crosshair border-2 border-gray-100"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Drawing canvas - draw any object"
          data-testid="canvas-drawing"
        />
      </div>

      <div className="flex-none p-6 flex justify-between items-center gap-4">
        <button
          onClick={clearCanvas}
          className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium text-lg transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 min-w-[120px]"
          data-testid="button-clear"
          aria-label="Clear the drawing canvas"
        >
          Clear
        </button>
        
        <button
          onClick={handleDone}
          disabled={!hasDrawn || !isConnected || isProcessing}
          className="px-12 py-4 rounded-xl bg-blue-600 text-white font-medium text-lg transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] shadow-lg hover:shadow-xl"
          data-testid="button-done"
          aria-label="Submit drawing for AI classification"
        >
          Done
        </button>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-gray-400">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"} ${isConnected ? "animate-pulse" : ""}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}
