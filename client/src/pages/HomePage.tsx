import { Link } from "wouter";
import { Pencil, Brain, Lock } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
      <ParticleBackground />
      
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight"
          data-testid="text-main-title"
        >
          AI Image Classification Station
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 font-medium">
          Experience how machines see and understand visual information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Link href="/doodle">
          <div 
            className="group relative min-h-64 p-12 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100"
            data-testid="card-doodle-classifier"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Pencil className="w-10 h-10 text-blue-600" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Doodle Classifier
              </h2>
              
              <p className="text-gray-600 text-center text-lg">
                Draw any object and watch AI identify it in real-time
              </p>
              
              <div className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Start Drawing
              </div>
            </div>
          </div>
        </Link>

        <div 
          className="relative min-h-64 p-12 bg-white/70 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-gray-100 opacity-70"
          data-testid="card-digit-cnn"
        >
          <div className="absolute top-4 right-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Brain className="w-10 h-10 text-gray-400" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-500 mb-3">
              Digit CNN Visualizer
            </h2>
            
            <p className="text-gray-500 text-center text-lg">
              Explore how neural networks recognize handwritten digits
            </p>
            
            <div className="mt-6 px-6 py-2 rounded-full bg-gray-200 text-gray-500 font-medium text-sm uppercase tracking-wider">
              Coming Soon
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Exhibition Mode</span>
      </div>
    </div>
  );
}
