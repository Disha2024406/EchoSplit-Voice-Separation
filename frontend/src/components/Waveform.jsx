import React, { useMemo } from "react";
import { motion } from "framer-motion";

/** Deterministic pseudo-waveform driven by seed string (job id or speaker label). */
export default function Waveform({ seed = "echo", bars = 64, color = "#06B6D4", className = "" }) {
  const heights = useMemo(() => {
    const out = [];
    let h = 0;
    for (let i = 0; i < bars; i++) {
      // simple hash
      const t = (seed.charCodeAt(i % seed.length) * (i + 3)) % 97;
      h = 20 + (t * 1.15) % 80;
      out.push(h);
    }
    return out;
  }, [seed, bars]);

  return (
    <div className={`flex items-center gap-[3px] h-16 ${className}`} aria-hidden data-testid="waveform">
      {heights.map((h, i) => (
        <motion.span
          key={i}
          initial={{ height: 4, opacity: 0.3 }}
          animate={{ height: h, opacity: 0.85 }}
          transition={{ delay: i * 0.008, duration: 0.4 }}
          style={{ background: color, width: 3, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}
