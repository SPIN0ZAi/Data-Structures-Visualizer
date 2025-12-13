import { useEffect, useRef, useMemo } from 'react';

interface LetterGlitchProps {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
}

const LetterGlitch: React.FC<LetterGlitchProps> = ({
  glitchColors = ['#00ff00', '#ff0000', '#0000ff'],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useMemo(
    () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?0123456789',
    []
  );
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const lettersRef = useRef<string[][]>([]);
  const colorsRef = useRef<string[][]>([]);
  const targetColorsRef = useRef<string[][]>([]);
  const opacitiesRef = useRef<number[][]>([]);
  const targetOpacitiesRef = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initializeGrid();
    };

    const initializeGrid = () => {
      const cols = Math.ceil(canvas.width / charWidth);
      const rows = Math.ceil(canvas.height / charHeight);

      lettersRef.current = [];
      colorsRef.current = [];
      targetColorsRef.current = [];
      opacitiesRef.current = [];
      targetOpacitiesRef.current = [];

      for (let y = 0; y < rows; y++) {
        const row: string[] = [];
        const colorRow: string[] = [];
        const targetColorRow: string[] = [];
        const opacityRow: number[] = [];
        const targetOpacityRow: number[] = [];

        for (let x = 0; x < cols; x++) {
          row.push(letters[Math.floor(Math.random() * letters.length)]);
          const color =
            glitchColors[Math.floor(Math.random() * glitchColors.length)];
          colorRow.push(color);
          targetColorRow.push(color);
          opacityRow.push(Math.random() * 0.5 + 0.2);
          targetOpacityRow.push(Math.random() * 0.5 + 0.2);
        }

        lettersRef.current.push(row);
        colorsRef.current.push(colorRow);
        targetColorsRef.current.push(targetColorRow);
        opacitiesRef.current.push(opacityRow);
        targetOpacitiesRef.current.push(targetOpacityRow);
      }
    };

    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const interpolateColor = (color1: string, color2: string, factor: number) => {
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      if (!c1 || !c2) return color1;

      const r = Math.round(c1.r + (c2.r - c1.r) * factor);
      const g = Math.round(c1.g + (c2.g - c1.g) * factor);
      const b = Math.round(c1.b + (c2.b - c1.b) * factor);

      return `rgb(${r},${g},${b})`;
    };

    const calculateVignette = (x: number, y: number, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;

      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = distance / maxDist;

      let opacity = 1;

      if (outerVignette) {
        opacity *= 1 - normalizedDist * 0.8;
      }

      if (centerVignette) {
        const centerGradient = normalizedDist < 0.2 ? normalizedDist / 0.2 : 1;
        opacity *= centerGradient;
      }

      return Math.max(0, Math.min(1, opacity));
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      const rows = lettersRef.current.length;
      const cols = rows > 0 ? lettersRef.current[0].length : 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const posX = x * charWidth;
          const posY = y * charHeight;

          const vignetteOpacity = calculateVignette(
            posX,
            posY,
            canvas.width,
            canvas.height
          );

          if (smooth) {
            if (colorsRef.current[y][x] !== targetColorsRef.current[y][x]) {
              colorsRef.current[y][x] = interpolateColor(
                colorsRef.current[y][x],
                targetColorsRef.current[y][x],
                0.1
              );
            }
            if (
              Math.abs(opacitiesRef.current[y][x] - targetOpacitiesRef.current[y][x]) > 0.01
            ) {
              opacitiesRef.current[y][x] +=
                (targetOpacitiesRef.current[y][x] - opacitiesRef.current[y][x]) * 0.1;
            }
          } else {
            colorsRef.current[y][x] = targetColorsRef.current[y][x];
            opacitiesRef.current[y][x] = targetOpacitiesRef.current[y][x];
          }

          ctx.fillStyle = colorsRef.current[y][x];
          ctx.globalAlpha = opacitiesRef.current[y][x] * vignetteOpacity;
          ctx.fillText(lettersRef.current[y][x], posX, posY + charHeight);
        }
      }

      ctx.globalAlpha = 1;
    };

    const glitch = () => {
      const rows = lettersRef.current.length;
      const cols = rows > 0 ? lettersRef.current[0].length : 0;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (Math.random() < 0.05) {
            lettersRef.current[y][x] = letters[Math.floor(Math.random() * letters.length)];
            targetColorsRef.current[y][x] =
              glitchColors[Math.floor(Math.random() * glitchColors.length)];
            targetOpacitiesRef.current[y][x] = Math.random() * 0.5 + 0.2;
          }
        }
      }
    };

    const animate = () => {
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const glitchInterval = setInterval(glitch, glitchSpeed);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(glitchInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [letters, glitchColors, glitchSpeed, centerVignette, outerVignette, smooth]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  );
};

export default LetterGlitch;
