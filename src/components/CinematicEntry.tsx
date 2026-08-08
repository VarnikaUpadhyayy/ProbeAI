import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveBackground } from "@/components/LiveBackground";

export interface CinematicEntryProps {
  onComplete?: () => void;
}

const STATUS_PHRASES = [
  "> establishing probe link...",
  "> loading candidate profile...",
  "> calibrating question engine...",
  "> session ready.",
];

export function CinematicEntry({ onComplete }: CinematicEntryProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isContracting, setIsContracting] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Sequence controller
  useEffect(() => {
    // 1. Progress incrementer
    const startTime = Date.now();
    const duration = 2800; // 2.8s to reach 100%

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setPhraseIndex(0);
      } else if (pct < 65) {
        setPhraseIndex(1);
      } else if (pct < 95) {
        setPhraseIndex(2);
      } else {
        setPhraseIndex(3);
      }

      if (pct >= 100) {
        clearInterval(progressInterval);
      }
    }, 30);

    // 2. Trigger Boom Sequence at ~2.9s
    const boomTimeout = setTimeout(() => {
      if (prefersReducedMotion) {
        // Simple fade if reduced motion
        if (onComplete) onComplete();
      } else {
        // Step A: Anticipation contraction (150ms)
        setIsContracting(true);

        setTimeout(() => {
          // Step B: Shockwave light-burst explosion (300ms)
          setIsContracting(false);
          setIsExploding(true);

          setTimeout(() => {
            if (onComplete) onComplete();
          }, 320);
        }, 150);
      }
    }, 2900);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(boomTimeout);
    };
  }, [onComplete, prefersReducedMotion]);

  // Synapse nodes data (8 radiating directions)
  const synapseAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden text-foreground select-none"
    >
      {/* Background Particle Mesh */}
      <LiveBackground />
      <div className="pointer-events-none absolute inset-0 bg-[#0A0A0A]/70" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, #0A0A0A 90%)",
        }}
      />

      {/* Outer SVG Progress Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          className="absolute h-[380px] w-[380px] -rotate-90 pointer-events-none"
          viewBox="0 0 400 400"
        >
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="rgba(102, 178, 214, 0.1)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="200"
            r="180"
            fill="none"
            stroke="#66B2D6"
            strokeWidth="2.5"
            strokeDasharray={2 * Math.PI * 180}
            strokeDashoffset={
              2 * Math.PI * 180 * (1 - progress / 100)
            }
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.05s linear",
              filter: "drop-shadow(0 0 8px rgba(102, 178, 214, 0.8))",
            }}
          />
        </svg>

        {/* 3D CORE CONTAINER */}
        <motion.div
          animate={
            isContracting
              ? { scale: 0.25, opacity: 0.9 }
              : isExploding
              ? { scale: 1.5, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={
            isContracting
              ? { duration: 0.15, ease: [0.7, 0, 0.84, 0] }
              : isExploding
              ? { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.3 }
          }
          className="relative flex h-80 w-80 items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Back Orbit Ring (dimmer & blurred for 3D depth) */}
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity }}
            className="absolute h-96 w-96 rounded-full border border-[#66B2D6]/20 pointer-events-none"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(-65deg) rotateY(25deg)",
              filter: "blur(1.5px)",
            }}
          />

          {/* Mid Orbit Ring */}
          <motion.div
            animate={{ rotateZ: -360 }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
            className="absolute h-80 w-80 rounded-full border border-dashed border-[#66B2D6]/40 pointer-events-none"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(55deg) rotateY(-35deg)",
            }}
          />

          {/* Radiating Synapse Lines & Nodes */}
          {synapseAngles.map((deg, i) => (
            <div
              key={deg}
              className="absolute left-1/2 top-1/2 h-0.5 w-36 origin-left pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              {/* Synapse vector line */}
              <div className="h-full w-full bg-gradient-to-r from-[#66B2D6]/40 via-[#66B2D6]/20 to-transparent" />

              {/* Firing pulse dot */}
              <motion.div
                animate={{
                  x: [0, 140],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#66B2D6] shadow-[0_0_8px_#66B2D6]"
              />

              {/* Outer pulsing target node */}
              <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#66B2D6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#66B2D6] shadow-[0_0_10px_#66B2D6]" />
              </div>
            </div>
          ))}

          {/* Front Orbit Ring (sharp & bright) */}
          <motion.div
            animate={{ rotateZ: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="absolute h-72 w-72 rounded-full border-2 border-[#66B2D6]/60 pointer-events-none"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(72deg) rotateY(15deg)",
              boxShadow: "0 0 20px rgba(102, 178, 214, 0.4)",
            }}
          >
            {/* Orbiting node on front ring */}
            <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#66B2D6] shadow-[0_0_15px_#66B2D6]" />
          </motion.div>

          {/* ROTATING 3D GEOMETRIC CORE */}
          <motion.div
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 720],
              rotateZ: [0, 180],
            }}
            transition={{
              duration: 14,
              ease: "linear",
              repeat: Infinity,
            }}
            className="relative flex h-44 w-44 items-center justify-center"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          >
            {/* Polyhedral 3D Wireframe Rings */}
            {[
              "rotateX(0deg) rotateY(0deg)",
              "rotateX(45deg) rotateY(45deg)",
              "rotateX(-45deg) rotateY(90deg)",
              "rotateX(60deg) rotateY(-60deg)",
              "rotateX(120deg) rotateY(30deg)",
              "rotateX(-30deg) rotateY(150deg)",
            ].map((transformStr, idx) => (
              <div
                key={idx}
                className="absolute h-36 w-36 rounded-2xl border-1.5 border-[#66B2D6]/70 shadow-[0_0_15px_rgba(102,178,214,0.35)]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: transformStr,
                  boxShadow: "0 0 15px rgba(102, 178, 214, 0.35)",
                }}
              />
            ))}

            {/* Inner Pulsing Core Light */}
            <motion.div
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute h-16 w-16 rounded-full bg-[#66B2D6]"
              style={{
                boxShadow:
                  "0 0 50px 15px rgba(102, 178, 214, 0.8), 0 0 100px 30px rgba(102, 178, 214, 0.4)",
                background:
                  "radial-gradient(circle, #66B2D6 0%, rgba(102, 178, 214, 0.5) 50%, transparent 80%)",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Counter & Mono Status Text */}
      <div className="mt-12 flex flex-col items-center gap-3">
        {/* Progress Percentage */}
        <div className="font-mono text-sm font-bold tracking-[0.25em] text-[#66B2D6]">
          {progress}%
        </div>

        {/* Synced Phrase Display */}
        <div className="h-7 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs sm:text-sm font-medium tracking-[0.25em] text-[#66B2D6]/90"
            >
              {STATUS_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* BOOM LIGHT BURST SHOCKWAVE */}
      <AnimatePresence>
        {isExploding && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="h-[100vw] w-[100vw] rounded-full border-4 border-[#66B2D6] bg-[#66B2D6]/40"
              style={{
                boxShadow:
                  "0 0 120px 60px rgba(102, 178, 214, 0.9), inset 0 0 120px 60px rgba(102, 178, 214, 0.9)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
