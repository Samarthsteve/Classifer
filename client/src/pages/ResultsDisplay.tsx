import { useState, useEffect } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { RotateCcw, Wifi, WifiOff, Sparkles, Pencil } from "lucide-react";
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
}

function ConfidenceBar({ className, confidence, delay }: ConfidenceBarProps) {
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
      className={`flex items-center gap-4 py-2 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
    >
      <span className="w-28 text-xl md:text-2xl font-medium text-slate-200 capitalize">
        {className}
      </span>
      <div className="flex-1 h-10 md:h-12 bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-lg transition-all duration-700 ease-out relative overflow-hidden"
          style={{ width: `${width}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20" />
        </div>
      </div>
      <span className="w-16 md:w-20 text-xl md:text-2xl font-mono text-cyan-400 text-right">
        {Math.round(confidence * 100)}%
      </span>
    </div>
  );
}

interface TrainingOverlayProps {
  examples: string[];
}

function TrainingOverlay({ examples }: TrainingOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (examples.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % examples.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [examples.length]);

  if (examples.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {examples.map((example, index) => (
        <img
          key={example}
          src={example}
          alt={`Training example ${index + 1}`}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ 
            opacity: index === currentIndex ? 0.2 : 0,
          }}
        />
      ))}
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
    <div className="flex flex-col items-center justify-center min-h-screen">
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
      <div className="relative min-h-screen">
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
  const trainingExamples = result.trainingExamples[mainPrediction.class] || [];

  return (
    <div className="relative min-h-screen flex flex-col items-center py-8 px-6 overflow-hidden">
      <ParticleBackground />
      <ExhibitionHeader />
      
      <div className="animate-fade-in-up mt-12">
        <h2 
          className="text-xl md:text-2xl font-medium text-slate-400 text-center py-4"
          data-testid="text-result-title"
        >
          The AI thinks you drew...
        </h2>
      </div>

      <div 
        className="relative w-56 h-56 md:w-64 md:h-64 bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden mb-6 animate-scale-in border-4 border-slate-700/50"
        data-testid="container-drawing"
      >
        <img
          src={result.userDrawing}
          alt="Your drawing"
          className="w-full h-full object-contain"
          data-testid="img-user-drawing"
        />
        <TrainingOverlay examples={trainingExamples} />
      </div>

      <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
          data-testid="text-prediction-class"
        >
          {mainPrediction.class}
        </h1>
        <p 
          className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono text-cyan-400 mt-2"
          data-testid="text-prediction-confidence"
        >
          {Math.round(mainPrediction.confidence * 100)}%
        </p>
      </div>

      {alternatives.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-4">
            Alternative Predictions
          </p>
          <div 
            className="space-y-2 bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800/50"
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

      <button
        onClick={onReset}
        className="flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-medium shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
        data-testid="button-draw-again"
        aria-label="Draw another picture"
      >
        <RotateCcw className="w-5 h-5" />
        Draw Again
      </button>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-500">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}
