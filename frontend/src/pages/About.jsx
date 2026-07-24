import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="pt-28 pb-24 mx-auto max-w-4xl px-6 relative z-10" data-testid="page-about">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-5xl font-extralight tracking-tighter">
        Built as a <span className="font-extrabold">university AI research</span> project.
      </motion.h1>
      <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
        EchoSplit began as a final-year exploration into pragmatic multi-speaker analysis. The goal: assemble a
        professional-grade pipeline that a small team can actually run — CPU today, GPU tomorrow — without
        pretending complexity away.
      </p>
      <img
        src="https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjb21wdXRlcnxlbnwwfHx8fDE3ODQ4ODQ1MTl8MA&ixlib=rb-4.1.0&q=85"
        alt="University students"
        className="mt-8 rounded-2xl w-full object-cover max-h-96"
      />
      <div className="mt-10 grid md:grid-cols-3 gap-4">
        {[
          { k: "Mission", v: "Make speaker-aware transcription and translation accessible to every student." },
          { k: "Approach", v: "Composable service classes so any researcher can swap a stage in minutes." },
          { k: "License", v: "MIT-friendly for coursework; ethical use policy applied to dataset sources." },
        ].map((c) => (
          <div key={c.k} className="glass p-5">
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-500 mb-1">{c.k}</div>
            <p className="text-sm text-zinc-500 dark:text-zinc-300">{c.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
