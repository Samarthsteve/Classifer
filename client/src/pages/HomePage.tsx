import { Link } from "wouter";
import { Pencil, Brain, Lock, Sparkles } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";

export default function HomePage() {
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
