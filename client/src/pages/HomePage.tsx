import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Pencil, Brain, Lock, Sparkles, Monitor, Wifi } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";

type ViewMode = "tablet" | "desktop";

function getViewMode(): ViewMode {
  if (typeof window === "undefined") return "desktop";
  
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  
  if (modeParam === "tablet") return "tablet";
  if (modeParam === "desktop") return "desktop";
  
  return window.innerWidth < 768 ? "tablet" : "desktop";
}

function TabletHomeIdleScreen() {
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
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        <span>Ready</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => getViewMode());

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
    return <TabletHomeIdleScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
      <ParticleBackground />
      <ExhibitionHeader />
      
      <div className="text-center mb-16 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-blue-400 animate-pulse" />
        </div>
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight"
          data-testid="text-main-title"
        >
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            AI Image
          </span>
          <span className="text-white ml-3">
            Classification
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
          Experience how machines see and understand visual information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/doodle">
          <div 
            className="group relative min-h-72 p-10 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_-12px_rgba(59,130,246,0.5)] hover:scale-[1.02]"
            data-testid="card-doodle-classifier"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-400/50 transition-all duration-500">
                <Pencil className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
                Doodle Classifier
              </h2>
              
              <p className="text-slate-400 text-center text-base md:text-lg group-hover:text-slate-300 transition-colors duration-300">
                Draw any object and watch AI identify it in real-time
              </p>
              
              <div className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-blue-500/25">
                Start Drawing
              </div>
            </div>
          </div>
        </Link>

        <div 
          className="relative min-h-72 p-10 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center opacity-60"
          data-testid="card-digit-cnn"
        >
          <div className="absolute top-4 right-4">
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-slate-500" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-500 mb-3">
              Digit Classifier
            </h2>
            
            <p className="text-slate-600 text-center text-base md:text-lg">
              Explore how neural networks recognize handwritten digits
            </p>
            
            <div className="mt-6 px-5 py-2 rounded-full bg-slate-800/50 border border-slate-700/30 text-slate-500 font-medium text-xs uppercase tracking-wider">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
