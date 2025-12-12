import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { Loader2, Pencil, Eraser, Trash2, Send, Monitor, CheckCircle2, Sparkles, Home } from "lucide-react";
import type { DrawingPayload, PredictionResult } from "@shared/schema";

interface DrawingCanvasProps {
  onSubmit: (payload: DrawingPayload) => void;
  isProcessing: boolean;
  isConnected: boolean;
  isReconnecting: boolean;
  hasResult?: boolean;
  result?: PredictionResult | null;
}

type DrawingTool = "pen" | "eraser";

function TabletIdleScreen({ 
  isConnected, 
  result 
}: { 
  isConnected: boolean; 
  result?: PredictionResult | null;
}) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const mainPrediction = result?.predictions?.[0];

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <ParticleBackground />
      <ExhibitionHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full bg-emerald-500/10 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-emerald-500/20 animate-pulse" style={{ animationDelay: "150ms" }} />
            </div>
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          
          <h2 
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            data-testid="text-tablet-idle-title"
          >
            <span className="text-emerald-400">Drawing</span> Submitted
          </h2>
          
          {mainPrediction && (
            <div 
              className="mb-6 py-4 px-6 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50"
              data-testid="card-tablet-prediction"
            >
              <p className="text-sm text-slate-500 uppercase tracking-widest font-medium mb-2">
                AI Prediction
              </p>
              <p 
                className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 capitalize"
                data-testid="text-tablet-prediction-class"
              >
                {mainPrediction.class}
              </p>
              <p 
                className="text-lg font-mono text-cyan-400 mt-1"
                data-testid="text-tablet-prediction-confidence"
              >
                {Math.round(mainPrediction.confidence * 100)}% confidence
              </p>
            </div>
          )}
          
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Waiting for the display to be ready for the next drawing
            <span className="inline-block w-8 text-left">{".".repeat(dots)}</span>
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              <Monitor className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 font-medium">Viewing results on display</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-500 mt-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-medium">
              Please Wait
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-400 font-medium">AI Classification Complete</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-4 flex items-center gap-2 text-xs text-slate-500">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
      
      {/* Home button */}
      <Link href="/">
        <a className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white" data-testid="link-home-tablet-idle">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </a>
      </Link>
    </div>
  );
}

export default function DrawingCanvas({ 
  onSubmit, 
  isProcessing, 
  isConnected,
  isReconnecting,
  hasResult = false,
  result
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getCanvasSize = useCallback(() => {
    if (!containerRef.current) return { width: 400, height: 400 };
    const containerWidth = containerRef.current.clientWidth - 48;
    const containerHeight = containerRef.current.clientHeight - 280;
    // Max 450px for tablets, ensures room for header and controls
    const maxSize = window.innerWidth <= 1080 ? 450 : 600;
    const size = Math.min(containerWidth, containerHeight, maxSize);
    return { width: Math.max(280, size), height: Math.max(280, size) };
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

  // Re-initialize canvas when returning from idle screen
  useEffect(() => {
    if (!hasResult) {
      // Use requestAnimationFrame to ensure the canvas element is mounted and container has proper dimensions
      requestAnimationFrame(() => {
        initCanvas(false);
        setHasDrawn(false);
      });
    }
  }, [hasResult, initCanvas]);

  // Show tablet idle screen when we have a result (waiting for desktop to reset)
  if (hasResult) {
    return <TabletIdleScreen isConnected={isConnected} result={result} />;
  }

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

      <div className="flex-none pt-12 pb-2 px-6 text-center">
        <h2 
          className="text-2xl font-bold text-white"
          data-testid="text-drawing-prompt"
        >
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Draw
          </span>{" "}
          any object
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-400">
          cat, tree, house, car, flower, sun...
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
          <canvas
            ref={canvasRef}
            className="relative bg-white rounded-2xl shadow-2xl shadow-black/50 touch-none border-2 border-slate-600/50"
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

      <div className="flex-none px-6 pb-8 pt-2">
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
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
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-base transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
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
      
      {/* Home button */}
      <Link href="/">
        <a className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white z-10" data-testid="link-home-canvas">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </a>
      </Link>
    </div>
  );
}
