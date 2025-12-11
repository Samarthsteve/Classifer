import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Pencil, Brain, Lock, Sparkles, Monitor, Cpu, Network, Zap, ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { useWebSocket } from "@/hooks/useWebSocket";

type ViewMode = "tablet" | "desktop";

function getViewMode(): ViewMode {
  if (typeof window === "undefined") return "desktop";
  
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  
  if (modeParam === "tablet") return "tablet";
  if (modeParam === "desktop") return "desktop";
  
  return window.innerWidth < 768 ? "tablet" : "desktop";
}

function TabletHomeIdleScreen({ isConnected }: { isConnected: boolean }) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <ParticleBackground />
      <ExhibitionHeader />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto">
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-blue-500/10 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-pulse" style={{ animationDelay: "150ms" }} />
            </div>
            <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mx-auto shadow-2xl">
              <Pencil className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          
          <h1 
            className="text-3xl md:text-4xl font-black text-white mb-4"
            data-testid="text-tablet-home-title"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              AI Drawing
            </span>
            <span className="text-white block mt-1">
              Station
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Waiting for the exhibition to begin
            <span className="inline-block w-8 text-left">{".".repeat(dots)}</span>
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              <Monitor className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300 font-medium">Waiting for display selection</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-500 mt-6">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-medium">
              Standing By
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-400 font-medium">GSV AI Exhibition</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-4 flex items-center gap-2 text-xs text-slate-500">
        <div className={`w-2 h-2 rounded-full transition-all ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-500"}`} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode());
  const [, setLocation] = useLocation();

  const handleStartDrawing = useCallback(() => {
    // Navigate to doodle page with tablet mode preserved
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "tablet") {
      setLocation("/doodle?mode=tablet");
    } else {
      setLocation("/doodle");
    }
  }, [setLocation]);

  const { isConnected } = useWebSocket({
    mode: viewMode,
    onStartDrawing: handleStartDrawing,
  });

  useEffect(() => {
    const handleResize = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("mode")) {
        setViewMode(window.innerWidth < 768 ? "tablet" : "desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show tablet idle screen when in tablet mode
  if (viewMode === "tablet") {
    return <TabletHomeIdleScreen isConnected={isConnected} />;
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <ParticleBackground />
      <ExhibitionHeader />
      
      {/* Aurora glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Hero section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4"
            data-testid="text-main-title"
          >
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }}>
              Neural Network
            </span>
            <br />
            <span className="text-white">
              Playground
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Experience the magic of artificial intelligence through interactive demonstrations
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              <Network className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Deep Learning</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Interactive Demo</span>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/doodle">
            <div 
              className="group relative p-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex flex-col cursor-pointer transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_60px_-12px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
              data-testid="card-doodle-classifier"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-400/50 transition-all duration-500">
                    <Pencil className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                    Available
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-100 transition-colors duration-300">
                  Doodle Classifier
                </h2>
                
                <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                  Draw any object and watch a convolutional neural network identify it instantly. See how AI interprets your sketches.
                </p>
                
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                  <span>Start Drawing</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          <div 
            className="relative p-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 flex flex-col opacity-60"
            data-testid="card-digit-cnn"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
                <Brain className="w-7 h-7 text-slate-500" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
                <Lock className="w-3 h-3 text-slate-500" />
                <span className="text-slate-500 text-xs font-medium">Coming Soon</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-500 mb-2">
              Digit Classifier
            </h2>
            
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Explore how neural networks recognize handwritten digits using the classic MNIST dataset.
            </p>
            
            <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex-none flex justify-center pb-6 relative z-10">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-slate-400 font-medium">Powered by Deep Learning</span>
        </div>
      </div>
    </div>
  );
}
