import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ExhibitionHeader } from "@/components/ExhibitionHeader";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Home, Brain, Zap, Eye, Layers, Network, Lightbulb } from "lucide-react";

export default function DigitEducational() {
  const [, setLocation] = useLocation();

  const handleNavigateToDrawing = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    if (modeParam === "tablet") {
      setLocation("/digit?mode=tablet");
    } else {
      setLocation("/digit");
    }
  }, [setLocation]);

  useWebSocket({
    mode: "tablet",
    onStartDigitDrawing: handleNavigateToDrawing,
  });

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ParticleBackground />
      <ExhibitionHeader />

      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12 pt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Convolutional Neural Networks
              </span>
            </h1>
            <p className="text-slate-400">Understanding how AI learns to recognize digits</p>
          </div>

          {/* What is CNN */}
          <div className="mb-8 rounded-xl p-6 bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-4">
              <Brain className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-white mb-2">What is a CNN?</h2>
                <p className="text-slate-300 leading-relaxed">
                  A Convolutional Neural Network (CNN) is an AI system inspired by how our brains process visual information. It automatically learns to recognize patterns and features in images, making it perfect for tasks like digit recognition.
                </p>
              </div>
            </div>
          </div>

          {/* How CNNs Work */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              How CNNs Learn
            </h2>
            <div className="grid gap-4">
              {/* Layer 1 */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/40">
                <div className="flex items-start gap-3 mb-2">
                  <Eye className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Input Layer</p>
                    <p className="text-sm text-slate-400">The raw pixel values of your handwritten digit</p>
                  </div>
                </div>
              </div>

              {/* Layer 2 */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/40">
                <div className="flex items-start gap-3 mb-2">
                  <Network className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Convolutional Layers</p>
                    <p className="text-sm text-slate-400">Detect edges, curves, and patterns in the digit</p>
                  </div>
                </div>
              </div>

              {/* Layer 3 */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/40">
                <div className="flex items-start gap-3 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Pooling & Activation</p>
                    <p className="text-sm text-slate-400">Simplify information and add non-linear thinking</p>
                  </div>
                </div>
              </div>

              {/* Layer 4 */}
              <div className="rounded-lg p-4 bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/40">
                <div className="flex items-start gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Output Layer</p>
                    <p className="text-sm text-slate-400">Predicts which digit (0-9) it recognizes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Digits? */}
          <div className="mb-8 rounded-xl p-6 bg-gradient-to-br from-slate-800/60 to-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-3">Why Recognize Digits?</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold text-lg">•</span>
                <span><strong>Simple & Powerful:</strong> Digits are simple enough to learn quickly, yet demonstrate real AI capability</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold text-lg">•</span>
                <span><strong>Real-World Use:</strong> Postal codes, checks, forms - digit recognition powers many systems</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold text-lg">•</span>
                <span><strong>Foundation Knowledge:</strong> Understanding digit recognition teaches us how all image AI works</span>
              </li>
            </ul>
          </div>

          {/* The Process */}
          <div className="mb-12 rounded-xl p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-700/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">What Happens When You Submit</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold flex-shrink-0">1</span>
                <p className="text-slate-300 pt-0.5">Your drawing is converted to a 28×28 pixel image</p>
              </div>
              <div className="flex gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold flex-shrink-0">2</span>
                <p className="text-slate-300 pt-0.5">The CNN analyzes the pixel patterns</p>
              </div>
              <div className="flex gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold flex-shrink-0">3</span>
                <p className="text-slate-300 pt-0.5">It calculates confidence for each digit (0-9)</p>
              </div>
              <div className="flex gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-bold flex-shrink-0">4</span>
                <p className="text-slate-300 pt-0.5">Results appear on the display screen instantly</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pb-8">
            <p className="text-slate-500 text-sm">
              This technology is the foundation for modern computer vision systems
            </p>
          </div>
        </div>
      </div>

      {/* Home button */}
      <Link href="/" data-testid="link-home-educational">
        <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-300 transition-all hover:bg-slate-700/60 hover:text-white z-10 cursor-pointer">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Home</span>
        </div>
      </Link>
    </div>
  );
}
