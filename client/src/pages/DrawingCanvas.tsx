import { useRef, useState, useEffect, useCallback } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { Loader2, Pencil, Eraser, Trash2, Send } from "lucide-react";
import type { DrawingPayload } from "@shared/schema";

interface DrawingCanvasProps {
  onSubmit: (payload: DrawingPayload) => void;
  isProcessing: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
}

type DrawingTool = "pen" | "eraser";

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
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasSize = useCallback(() => {
    if (!containerRef.current) return { width: 500, height: 500 };
    const containerWidth = containerRef.current.clientWidth - 32;
    const containerHeight = containerRef.current.clientHeight - 180;
    const size = Math.min(containerWidth, containerHeight, 700);
    return { width: size, height: size };
  }, []);

  const initCanvas = useCallback((preserveDrawing = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = getCanvasSize();
    const dpr = window.devicePixelRatio || 1;
    
    let imageData: ImageData | null = null;
    if (preserveDrawing) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
    }
    
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
      
      if (preserveDrawing && imageData) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.putImageData(imageData, 0, 0);
          ctx.drawImage(tempCanvas, 0, 0, width, height);
        }
      }
    }
  }, [getCanvasSize]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    if (currentTool === "pen") {
      setHasDrawn(true);
    }
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
      ctx.globalCompositeOperation = "source-over";
      
      if (currentTool === "eraser") {
        ctx.lineWidth = 30;
        ctx.strokeStyle = "#FFFFFF";
      } else {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
      }
      
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

    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = 280;
    displayCanvas.height = 280;
    const displayCtx = displayCanvas.getContext("2d");
    
    if (!displayCtx) return;
    
    displayCtx.fillStyle = "#FFFFFF";
    displayCtx.fillRect(0, 0, 280, 280);
    displayCtx.drawImage(canvas, 0, 0, 280, 280);
    const displayImage = displayCanvas.toDataURL("image/png");

    const modelCanvas = document.createElement("canvas");
    modelCanvas.width = 28;
    modelCanvas.height = 28;
    const modelCtx = modelCanvas.getContext("2d");
    
    if (!modelCtx) return;
    
    modelCtx.fillStyle = "#FFFFFF";
    modelCtx.fillRect(0, 0, 28, 28);
    modelCtx.drawImage(canvas, 0, 0, 28, 28);
    
    const imageData = modelCtx.getImageData(0, 0, 28, 28);
    const grayscaleData: number[] = [];
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const gray = (r + g + b) / 3;
      let normalized = 1 - (gray / 255);
      
      if (!Number.isFinite(normalized) || Number.isNaN(normalized)) {
        normalized = 0;
      }
      
      normalized = Math.round(Math.max(0, Math.min(1, normalized)) * 1000) / 1000;
      grayscaleData.push(normalized);
    }

    if (grayscaleData.length !== 784) {
      console.error("Invalid grayscale data length:", grayscaleData.length);
      return;
    }

    const allValid = grayscaleData.every(v => 
      Number.isFinite(v) && v >= 0 && v <= 1
    );
    
    if (!allValid) {
      console.error("Grayscale data contains invalid values");
      return;
    }

    onSubmit({
      displayImage,
      modelData: grayscaleData,
      width: 28,
      height: 28,
    });
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden" ref={containerRef}>
      <ParticleBackground />
      <ExhibitionHeader />
      
      {(isProcessing || isReconnecting) && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
          </div>
          <p className="mt-6 text-2xl font-medium text-slate-200">
            {isReconnecting ? "Connecting..." : "AI is analyzing..."}
          </p>
          <p className="mt-2 text-slate-500">
            {isReconnecting ? "Please wait" : "Processing your drawing"}
          </p>
        </div>
      )}

      <div className="flex-none pt-16 pb-4 px-4 text-center">
        <h2 
          className="text-xl md:text-2xl font-semibold text-white"
          data-testid="text-drawing-prompt"
        >
          Draw any object
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          cat, tree, house, car, flower...
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="bg-white rounded-xl shadow-2xl shadow-black/50 touch-none border-4 border-slate-700/50"
            style={{ cursor: currentTool === "eraser" ? "cell" : "crosshair" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            aria-label="Drawing canvas"
            data-testid="canvas-drawing"
          />
        </div>
      </div>

      <div className="flex-none p-4 pb-6">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 border border-slate-700/50">
            <button
              onClick={() => setCurrentTool("pen")}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentTool === "pen"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              data-testid="button-pen"
              aria-label="Pen tool"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentTool("eraser")}
              className={`p-3 rounded-lg transition-all duration-200 ${
                currentTool === "eraser"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              data-testid="button-eraser"
              aria-label="Eraser tool"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-700 mx-1" />
            <button
              onClick={clearCanvas}
              className="p-3 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              data-testid="button-clear"
              aria-label="Clear canvas"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleDone}
            disabled={!hasDrawn || !isConnected || isProcessing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            data-testid="button-done"
            aria-label="Submit drawing"
          >
            <Send className="w-5 h-5" />
            <span>Classify</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-2 left-4 flex items-center gap-2 text-xs text-slate-500">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}
