import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initStars();
    };

    const initStars = () => {
      const starCount = isMobile ? 100 : 200;
      starsRef.current = [];
      
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    };

    const initParticles = () => {
      const baseDensity = isMobile ? 25000 : 12000;
      const maxParticles = isMobile ? 50 : 150;
      const particleCount = Math.min(
        Math.floor((canvas.width * canvas.height) / baseDensity),
        maxParticles
      );
      particlesRef.current = [];

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      timeRef.current += 0.016;

      ctx.fillStyle = "rgba(8, 12, 24, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(timeRef.current * 2 + star.x * 0.01) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();
      });

      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const twinkle = Math.sin(timeRef.current * particle.twinkleSpeed * 100 + particle.twinklePhase) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * (0.5 + twinkle * 0.5);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${currentOpacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${currentOpacity * 0.3})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${currentOpacity * 0.1})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    ctx.fillStyle = "#080C18";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      <div 
        className="absolute inset-0" 
        style={{
          background: "radial-gradient(ellipse at 50% 0%, #0f172a 0%, #080C18 50%, #020617 100%)"
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
