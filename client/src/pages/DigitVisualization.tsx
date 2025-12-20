import { useState, useEffect } from "react";
import { DIGIT_CLASSES } from "@shared/schema";
import { Sparkles } from "lucide-react";

export default function DigitVisualization() {
  const [displayedDigits, setDisplayedDigits] = useState<{ [key: string]: string }>({});
  const [animatingDigit, setAnimatingDigit] = useState<string | null>(null);

  useEffect(() => {
    // Generate random MNIST-like digit pixels for visualization
    const generateDigit = (digit: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 56;
      canvas.height = 56;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 56, 56);

      ctx.font = "bold 40px Arial, sans-serif";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(digit, 28, 28);

      return canvas.toDataURL("image/png");
    };

    const digits: { [key: string]: string } = {};
    DIGIT_CLASSES.forEach((digit) => {
      digits[digit] = generateDigit(digit);
    });
    setDisplayedDigits(digits);
  }, []);

  const handleDigitHover = (digit: string) => {
    setAnimatingDigit(digit);
    setTimeout(() => setAnimatingDigit(null), 600);
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <div className="flex-none pt-8 px-6 pb-4 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-widest text-purple-400">Digit Classification</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Neural Network
          </span>
          {" "}Visualization
        </h1>
        <p className="text-sm text-slate-400">Interactive digit recognition system</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-2xl w-full">
          {/* Digit grid */}
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 text-center mb-6">
              AI can recognize these digits
            </p>
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {DIGIT_CLASSES.map((digit) => (
                <button
                  key={digit}
                  onMouseEnter={() => handleDigitHover(digit)}
                  onClick={() => handleDigitHover(digit)}
                  className={`relative group transition-all duration-300 transform ${
                    animatingDigit === digit ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  {/* Outer glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300 ${
                      animatingDigit === digit ? "from-purple-500/30 to-pink-500/30" : ""
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`relative p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 ${
                      animatingDigit === digit ? "border-purple-500/80 shadow-xl shadow-purple-500/20" : ""
                    }`}
                  >
                    {/* Digit display */}
                    <div className="aspect-square flex items-center justify-center rounded-lg bg-white/5 border border-slate-600/30 group-hover:bg-white/10 transition-all duration-300">
                      {displayedDigits[digit] ? (
                        <img
                          src={displayedDigits[digit]}
                          alt={`Digit ${digit}`}
                          className="w-12 h-12 md:w-14 md:h-14 object-contain"
                        />
                      ) : (
                        <span className="text-2xl md:text-3xl font-bold text-slate-400">{digit}</span>
                      )}
                    </div>

                    {/* Animated pulse on hover */}
                    {animatingDigit === digit && (
                      <div className="absolute inset-0 rounded-2xl animate-pulse bg-purple-500/10" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info section */}
          <div className="rounded-xl p-6 bg-gradient-to-r from-slate-800/40 to-slate-800/20 border border-slate-700/30 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span>Draw or input a digit on your device</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span>AI analyzes the visual patterns</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span>Results appear on the display screen instantly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none px-6 py-4 text-center text-xs text-slate-500 relative z-10">
        <p>Watch the display for real-time AI predictions</p>
      </div>
    </div>
  );
}
