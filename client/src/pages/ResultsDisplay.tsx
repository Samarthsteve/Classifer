import { useState, useEffect } from "react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { RotateCcw, Wifi, WifiOff } from "lucide-react";
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(confidence * 100);
    }, delay);
    return () => clearTimeout(timer);
  }, [confidence, delay]);

  return (
    <div className="flex items-center gap-4 py-2">
      <span className="w-28 text-xl md:text-2xl font-medium text-gray-700 capitalize">
        {className}
      </span>
      <div className="flex-1 h-10 md:h-12 bg-gray-100 rounded-lg overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-16 md:w-20 text-xl md:text-2xl font-mono text-gray-600 text-right">
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
            opacity: index === currentIndex ? 0.3 : 0,
          }}
        />
      ))}
    </div>
  );
}

function WaitingState({ isConnected, isReconnecting }: { isConnected: boolean; isReconnecting: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-xl mx-auto px-6">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-8 mx-auto animate-pulse">
          {isConnected ? (
            <Wifi className="w-12 h-12 text-blue-500" />
          ) : (
            <WifiOff className="w-12 h-12 text-gray-400" />
          )}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {isReconnecting ? "Reconnecting..." : "Waiting for Drawing"}
        </h2>
        
        <p className="text-xl text-gray-600">
          {isConnected 
            ? "Draw something on the tablet to see the AI's prediction here" 
            : "Connecting to the drawing station..."}
        </p>
        
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
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
        <WaitingState isConnected={isConnected} isReconnecting={isReconnecting} />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-gray-400">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"} ${isConnected ? "animate-pulse" : ""}`} />
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
      
      <div className="animate-fade-in-up">
        <h2 
          className="text-2xl md:text-3xl font-medium text-gray-700 text-center py-6"
          data-testid="text-result-title"
        >
          The AI thinks you drew...
        </h2>
      </div>

      <div 
        className="relative w-64 h-64 md:w-72 md:h-72 bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-scale-in"
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

      <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h1 
          className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 uppercase tracking-tight"
          data-testid="text-prediction-class"
        >
          {mainPrediction.class}
        </h1>
        <p 
          className="text-5xl md:text-6xl lg:text-7xl font-bold font-mono text-emerald-600 mt-2"
          data-testid="text-prediction-confidence"
        >
          {Math.round(mainPrediction.confidence * 100)}%
        </p>
      </div>

      {alternatives.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mb-12">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
            Alternative Predictions
          </p>
          <div 
            className="space-y-3"
            data-testid="container-alternatives"
          >
            {alternatives.map((pred, index) => (
              <ConfidenceBar
                key={pred.class}
                className={pred.class}
                confidence={pred.confidence}
                delay={300 + index * 75}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="px-16 py-6 rounded-2xl bg-blue-600 text-white text-xl font-medium shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-3"
        data-testid="button-draw-again"
        aria-label="Draw another picture"
      >
        <RotateCcw className="w-6 h-6" />
        Draw Again
      </button>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-gray-400">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"} ${isConnected ? "animate-pulse" : ""}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}
