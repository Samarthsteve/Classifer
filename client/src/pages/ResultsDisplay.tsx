import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { RotateCcw, Sparkles, Pencil, WifiOff, TrendingUp, Brain, Lightbulb, Zap, Home } from "lucide-react";
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
      
      {/* Home button */}
      <Link href="/">
        <a className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white" data-testid="link-home-idle">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </a>
      </Link>
    </div>
  );
}

// Educational annotation component
function EducationalNote({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: typeof Brain; 
  title: string; 
  description: string; 
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-300 mb-0.5">{title}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Circular confidence gauge component
function ConfidenceGauge({ confidence, delay }: { confidence: number; delay: number }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const visTimer = setTimeout(() => setIsVisible(true), delay);
    const progressTimer = setTimeout(() => setProgress(confidence * 100), delay + 100);
    return () => {
      clearTimeout(visTimer);
      clearTimeout(progressTimer);
    };
  }, [confidence, delay]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative transition-all duration-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-slate-800"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#gaugeGradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold font-mono text-cyan-400">{Math.round(progress)}%</span>
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
      
      {/* Aurora glow effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      {/* Main content area - side by side layout */}
      <div className="flex-1 flex items-center justify-center px-8 pt-16 pb-4 relative z-10">
        <div className="flex items-stretch gap-10 max-w-7xl w-full h-full max-h-[650px]">
          
          {/* Left side - Drawing with frame */}
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="text-center mb-4">
              <p className="text-sm font-medium uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" />
                Your Drawing
              </p>
            </div>
            
            {/* Glass frame container */}
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
              
              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-500/50 rounded-tl" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-500/50 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-500/50 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-500/50 rounded-br" />
              
              <div 
                className="relative aspect-square w-full max-w-[280px] bg-white rounded-xl shadow-xl overflow-hidden animate-scale-in"
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
            
            {/* Educational note below drawing */}
            <div className="mt-4 max-w-[320px]">
              <EducationalNote
                icon={Lightbulb}
                title="How it works"
                description="Your drawing is converted to a 28x28 pixel image, then analyzed by a neural network trained on millions of sketches."
                delay={600}
              />
            </div>
          </div>

          {/* Center divider with flowing line */}
          <div className="relative w-px">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-600/50 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 animate-pulse" />
          </div>

          {/* Right side - Predictions */}
          <div className="flex-1 flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            {/* Main prediction with gauge */}
            <div className="flex items-center gap-6 mb-6">
              <ConfidenceGauge confidence={mainPrediction.confidence} delay={200} />
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                  <Brain className="w-3 h-3" />
                  AI Prediction
                </p>
                <h1 
                  className="text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent animate-shimmer"
                  data-testid="text-prediction-class"
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  {mainPrediction.class}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  The AI is <span className="text-cyan-400 font-medium">{Math.round(mainPrediction.confidence * 100)}%</span> confident
                </p>
              </div>
            </div>

            {/* Alternative predictions */}
            {alternatives.length > 0 && (
              <div className="w-full mb-4">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
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
                      delay={400 + index * 100}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Educational notes */}
            <div className="space-y-2">
              <EducationalNote
                icon={Zap}
                title="Pattern Recognition"
                description="The neural network compares your strokes against learned patterns from thousands of training examples."
                delay={800}
              />
              <EducationalNote
                icon={Brain}
                title="Confidence Score"
                description="Higher percentages mean the AI found stronger matches. Lower scores suggest the drawing could match multiple categories."
                delay={1000}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Draw Again button */}
      <div className="flex-none flex justify-center pb-6 relative z-10">
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
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-500 z-10">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
      
      {/* Home button */}
      <Link href="/">
        <a className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white z-10" data-testid="link-home-results">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </a>
      </Link>
    </div>
  );
}
