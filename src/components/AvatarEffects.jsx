import { useEffect, useRef } from "react";

export function AvatarEffects({ isSpeaking, isLoading, sentiment }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  const sentimentColors = {
    neutral:  { primary: "#60a5fa", secondary: "#1a3a6c" },
    positive: { primary: "#4ade80", secondary: "#166534" },
    concerned:{ primary: "#fbbf24", secondary: "#854d0e" },
    urgent:   { primary: "#f87171", secondary: "#991b1b" },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Crée les particules médicales
    const symbols = ["+", "♥", "✚", "◆", "●", "○", "·"];
    particlesRef.current = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 6 + Math.random() * 10,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -0.2 - Math.random() * 0.4,
      opacity: 0.03 + Math.random() * 0.12,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const colors = sentimentColors[sentiment] || sentimentColors.neutral;

      particlesRef.current.forEach(p => {
        p.pulse += p.pulseSpeed;
        const opacity = p.opacity + Math.sin(p.pulse) * 0.04;

        ctx.font = `${p.size}px Arial`;
        ctx.fillStyle = `${colors.primary}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;
        ctx.fillText(p.symbol, p.x, p.y);

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
      });

      // Halo de couleur en bas selon sentiment
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height,
        0, canvas.width / 2, canvas.height, canvas.width * 0.6
      );
      gradient.addColorStop(0, `${colors.primary}18`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Halo speaking
      if (isSpeaking) {
        const t = Date.now() / 1000;
        const pulse = 0.5 + Math.sin(t * 3) * 0.3;
        const glowGrad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height * 0.6,
          0, canvas.width / 2, canvas.height * 0.6, canvas.width * 0.35 * pulse
        );
        glowGrad.addColorStop(0, `${colors.primary}22`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [sentiment, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0
      }}
    />
  );
}