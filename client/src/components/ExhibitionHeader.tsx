import { useEffect, useState } from "react";

export function ExhibitionHeader() {
  const [isFlashing, setIsFlashing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlashing(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed top-4 left-4 z-50 flex items-center gap-3"
      data-testid="header-exhibition"
    >
      <div 
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
          isFlashing 
            ? "bg-emerald-400 shadow-[0_0_12px_4px_rgba(52,211,153,0.6)]" 
            : "bg-emerald-600 shadow-[0_0_6px_2px_rgba(52,211,153,0.3)]"
        }`}
        data-testid="indicator-live"
      />
      <span 
        className="text-sm md:text-base font-bold tracking-widest uppercase text-white/90"
        style={{ fontFamily: "var(--font-mono)" }}
        data-testid="text-exhibition-title"
      >
        GSV AI Exhibition
      </span>
    </div>
  );
}
