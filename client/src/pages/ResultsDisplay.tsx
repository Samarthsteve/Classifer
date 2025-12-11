import { useState, useEffect } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { RotateCcw, Sparkles, Pencil, WifiOff, TrendingUp } from "lucide-react";
import type { PredictionResult } from "@shared/schema";

interface ResultsDisplayProps {
  result: PredictionResult | null;
  onReset: () => void;
  isConnected: boolean;
  isReconnecting: boolean;
}

interface ConfidenceBarProps {
  className: string;
  confidence: number;
  delay: number;
  isTop?: boolean;
}

function ConfidenceBar({ className, confidence, delay, isTop = false }: ConfidenceBarProps) {
  const [width, setWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const visTimer = setTimeout(() => setIsVisible(true), delay - 100);
    const widthTimer = setTimeout(() => setWidth(confidence * 100), delay);
    return () => {
      clearTimeout(visTimer);
      clearTimeout(widthTimer);
    };
  }, [confidence, delay]);

  return (
    <div 
      className={`flex items-center gap-3 py-2 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
    >
      <span className={`w-24 font-medium capitalize truncate ${isTop ? "text-lg text-white" : "text-base text-slate-300"}`}>
        {className}
      </span>
      <div className={`flex-1 ${isTop ? "h-8" : "h-6"} bg-slate-800/80 rounded-md overflow-hidden border border-slate-700/50`}>
        <div
          className={`h-full rounded-md transition-all duration-700 ease-out relative overflow-hidden ${
            isTop 
              ? "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500" 
              : "bg-gradient-to-r from-slate-600 to-slate-500"
          }`}
          style={{ width: `${width}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10" />
        </div>
      </div>
      <span className={`w-14 font-mono text-right ${isTop ? "text-lg text-cyan-400" : "text-base text-slate-400"}`}>
        {Math.round(confidence * 100)}%
      </span>
    </div>
  );
}

function IdleScreen({ isConnected, isReconnecting }: { isConnected: boolean; isReconnecting: boolean }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center max-w-2xl mx-auto px-8">
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-blue-500/10 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-pulse" style={{ animationDelay: "150ms" }} />
          </div>
          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mx-auto shadow-2xl">
            {isConnected ? (
              <Pencil className="w-12 h-12 text-blue-400" />
            ) : (
              <WifiOff className="w-12 h-12 text-slate-500" />
            )}
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {isReconnecting ? (
            "Reconnecting"
          ) : isConnected ? (
            <>
              <span className="text-blue-400">Waiting</span> for Drawing
            </>
          ) : (
            "Connecting"
          )}
          <span className="inline-block w-12 text-left">{".".repeat(dots)}</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
          {isConnected 
            ? "Draw something on the tablet and the AI prediction will appear here" 
            : "Establishing connection to the drawing station"}
        </p>
        
        {isConnected && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-sm text-slate-600 uppercase tracking-widest font-medium">
              Awaiting Input
            </p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-slate-400 font-medium">AI-Powered Image Classification</span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ result, onReset, isConnected, isReconnecting }: ResultsDisplayProps) {
  if (!result) {
    return (
      <div className="relative h-screen overflow-hidden">
        <ParticleBackground />
        <ExhibitionHeader />
        <IdleScreen isConnected={isConnected} isReconnecting={isReconnecting} />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-500">
          <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>
    );
  }

  const [mainPrediction, ...alternatives] = result.predictions;

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <ParticleBackground />
      <ExhibitionHeader />
      
      {/* Main content area - side by side layout */}
      <div className="flex-1 flex items-center justify-center px-8 pt-16 pb-4">
        <div className="flex items-stretch gap-8 max-w-6xl w-full h-full max-h-[600px]">
          
          {/* Left side - Drawing */}
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
                Your Drawing
              </p>
            </div>
            <div 
              className="relative aspect-square w-full max-w-[320px] bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scale-in border-4 border-slate-700/50"
              data-testid="container-drawing"
            >
              <img
                src={result.userDrawing}
                alt="Your drawing"
                className="w-full h-full object-contain"
                data-testid="img-user-drawing"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-slate-700/50 to-transparent" />

          {/* Right side - Predictions */}
          <div className="flex-1 flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Main prediction */}
            <div className="text-center mb-6">
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500 mb-3">
                AI Prediction
              </p>
              <h1 
                className="text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2"
                data-testid="text-prediction-class"
              >
                {mainPrediction.class}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <p 
                  className="text-3xl lg:text-4xl font-bold font-mono text-cyan-400"
                  data-testid="text-prediction-confidence"
                >
                  {Math.round(mainPrediction.confidence * 100)}%
                </p>
              </div>
            </div>

            {/* Alternative predictions */}
            {alternatives.length > 0 && (
              <div className="w-full">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-3">
                  Other Possibilities
                </p>
                <div 
                  className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800/50"
                  data-testid="container-alternatives"
                >
                  {alternatives.map((pred, index) => (
                    <ConfidenceBar
                      key={pred.class}
                      className={pred.class}
                      confidence={pred.confidence}
                      delay={300 + index * 100}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom - Draw Again button */}
      <div className="flex-none flex justify-center pb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-medium shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
          data-testid="button-draw-again"
          aria-label="Draw another picture"
        >
          <RotateCcw className="w-5 h-5" />
          Draw Again
        </button>
      </div>

      {/* Connection status */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-500">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-8 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-slate-400 font-medium">AI Classification</span>
      </div>
    </div>
  );
}
