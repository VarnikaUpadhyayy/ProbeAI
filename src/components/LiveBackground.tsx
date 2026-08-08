import { useEffect, useRef } from "react";

/** A 3D point carrying a code snippet label and a color category */
type CodeParticle = {
  x: number;
  y: number;
  z: number;
  label: string;
  color: number; // 0 = keyword/cyan, 1 = string/green, 2 = symbol/muted, 3 = number/purple
};

// Code tokens that will float through 3D space
const CODE_KEYWORDS = [
  "const", "let", "function", "return", "async", "await",
  "import", "export", "class", "interface", "type",
  "if", "else", "for", "while", "switch",
  "try", "catch", "throw", "new", "this",
  "void", "null", "true", "false", "yield",
  "extends", "implements", "readonly", "static",
  "public", "private", "abstract", "override",
];

const CODE_FUNCTIONS = [
  "map()", "filter()", "reduce()", "forEach()",
  "useState()", "useEffect()", "useRef()", "useMemo()",
  "fetch()", "then()", "catch()", "resolve()",
  "querySelector()", "addEventListener()",
  "JSON.parse()", "console.log()", "Math.random()",
  "Promise.all()", "Array.from()", "Object.keys()",
  "setTimeout()", "setInterval()", "requestAnimationFrame()",
];

const CODE_SYMBOLS = [
  "=>", "===", "!==", "&&", "||", "??",
  "...", "{}", "[]", "</>", "?.", "::",
  "+=", "-=", "**", ">>", "<<", "!=",
  ">=", "<=", "++", "--", "|>", "~>",
  "#{", "@", "<%", "%>", "/*", "*/",
];

const CODE_STRINGS = [
  '"hello"', "'world'", "`${}`", '"AI"', '"probe"',
  '"data"', "'api'", '"model"', "'query'", '"agent"',
  "'token'", '"score"', "'eval'", '"path"', "'node'",
];

const CODE_NUMBERS = [
  "0x1F", "42", "3.14", "0b1010", "1e6",
  "0xFF", "256", "1024", "2048", "0o77",
  "NaN", "Infinity", "0n", "100%", "360deg",
];

const CODE_TYPES = [
  "<T>", "string", "number", "boolean", "Promise<>",
  "Record<>", "Partial<>", "Omit<>", "Pick<>", "Map<>",
  "Set<>", "Array<>", "Readonly<>", "Required<>", "Exclude<>",
];

/**
 * Full-viewport live 3D background: flowing code snippets
 * drifting through perspective space, reacting to pointer movement.
 * Purely decorative.
 */
export function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Build particle pool from all code categories
    const allTokens: { label: string; color: number }[] = [];
    CODE_KEYWORDS.forEach((t) => allTokens.push({ label: t, color: 0 }));
    CODE_FUNCTIONS.forEach((t) => allTokens.push({ label: t, color: 0 }));
    CODE_TYPES.forEach((t) => allTokens.push({ label: t, color: 0 }));
    CODE_STRINGS.forEach((t) => allTokens.push({ label: t, color: 1 }));
    CODE_SYMBOLS.forEach((t) => allTokens.push({ label: t, color: 2 }));
    CODE_NUMBERS.forEach((t) => allTokens.push({ label: t, color: 3 }));

    const COUNT = 130;
    const pts: CodeParticle[] = [];
    for (let i = 0; i < COUNT; i++) {
      const token = allTokens[Math.floor(Math.random() * allTokens.length)]!;
      pts.push({
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 2.4,
        z: Math.random() * 2 - 1,
        label: token.label,
        color: token.color,
      });
    }

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let scroll = 0;
    const onScroll = () => {
      scroll = window.scrollY / Math.max(1, document.body.scrollHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const start = performance.now();

    // Vibrant, elegant light color palettes for background code tokens
    const colors: [number, number, number][] = [
      [102, 178, 214], // ProbeAI cyan — keywords/functions/types
      [120, 210, 150], // soft mint green — strings
      [140, 165, 195], // steel blue — symbols
      [175, 135, 230], // soft lavender — numbers
    ];

    const draw = (now: number) => {
      const time = (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.max(width, height) * 0.85;

      // 3D rotation — slow drift + pointer influence + scroll
      const ry = time * 0.04 + pointer.x * 0.45;
      const rx = Math.sin(time * 0.035) * 0.1 + pointer.y * 0.3 + scroll * 1.0;
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);

      // Project all particles
      const proj: { x: number; y: number; s: number; idx: number }[] = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        const z0 = ((p.z + time * 0.05) % 2) - 1;
        const x1 = p.x * cosY - z0 * sinY;
        const z1 = p.x * sinY + z0 * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const persp = 1.9 / (2.2 + z2);
        proj.push({
          x: cx + x1 * scale * persp * 0.5,
          y: cy + y1 * scale * persp * 0.45,
          s: persp,
          idx: i,
        });
      }

      // Sort by depth (back to front) for proper layering
      proj.sort((a, b) => a.s - b.s);

      // Draw light connection lines between nearby code tokens
      const linkDist = Math.min(width, height) * 0.11;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < proj.length; i++) {
        const a = proj[i]!;
        for (let j = i + 1; j < i + 6 && j < proj.length; j++) {
          const b = proj[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > linkDist) continue;
          const alpha = (1 - d / linkDist) * 0.06 * ((a.s + b.s) / 2);
          ctx.strokeStyle = `rgba(102,178,214,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Draw light, crisp code tokens as text
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i]!;
        const particle = pts[p.idx]!;
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.2 + p.idx * 0.7);
        const depthAlpha = Math.max(0, (p.s - 0.4) * 1.3);
        // Light, clear opacity range (0.12 to 0.28) for optimal visibility without congestion
        const alpha = depthAlpha * (0.12 + pulse * 0.16);

        if (alpha < 0.02) continue;

        const [r, g, b] = colors[particle.color]!;
        const fontSize = Math.max(7, Math.min(12, p.s * 10));

        ctx.font = `${fontSize.toFixed(1)}px "IBM Plex Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (p.s > 0.75 && alpha > 0.18) {
          ctx.shadowColor = `rgba(${r},${g},${b},${(alpha * 0.35).toFixed(3)})`;
          ctx.shadowBlur = fontSize * 0.5;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.fillText(particle.label, p.x, p.y);
      }

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
