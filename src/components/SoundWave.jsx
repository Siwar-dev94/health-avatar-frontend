import { useEffect, useRef } from "react";

export function SoundWave({ isSpeaking, isListening, isLoading, lipValue, sentiment }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const smoothRef = useRef(0);

  const colors = {
    neutral:  "#60a5fa",
    positive: "#4ade80",
    concerned:"#fbbf24",
    urgent:   "#f87171",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      const color = isListening ? "#ef4444" : colors[sentiment] || colors.neutral;
      const target = isSpeaking ? lipValue : isListening ? 0.6 + Math.random() * 0.4 : isLoading ? 0.15 + Math.sin(Date.now()/400)*0.1 : 0.05;
      smoothRef.current += (target - smoothRef.current) * 0.15;
      const amp = smoothRef.current;

      const bars = 48;
      const barW = W / bars - 1.5;
      const t = Date.now() / 1000;

      for (let i = 0; i < bars; i++) {
        const progress = i / bars;
        const wave1 = Math.sin(progress * Math.PI * 4 + t * 4) * amp;
        const wave2 = Math.sin(progress * Math.PI * 2 + t * 2.5) * amp * 0.6;
        const wave3 = Math.sin(progress * Math.PI * 6 + t * 6) * amp * 0.3;
        const combined = (wave1 + wave2 + wave3) / 1.9;
        const barH = Math.max(2, (Math.abs(combined) + 0.04) * H * 0.85);
        const x = i * (barW + 1.5);
        const y = (H - barH) / 2;

        // Dégradé sur chaque barre
        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, `${color}44`);
        grad.addColorStop(0.5, `${color}cc`);
        grad.addColorStop(1, `${color}44`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }

      // Ligne centrale
      ctx.strokeStyle = `${color}33`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking, isListening, isLoading, lipValue, sentiment]);

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: "80px", zIndex: 1, pointerEvents: "none"
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}