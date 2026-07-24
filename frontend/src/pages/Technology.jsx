import React from "react";
import { motion } from "framer-motion";

const models = [
  { name: "SpeechBrain SepFormer", role: "Speaker Separation", weight: "sepformer-whamr", note: "Transformer masking network trained on WHAMR!" },
  { name: "ECAPA-TDNN", role: "Speaker Identification", weight: "spkrec-ecapa-voxceleb", note: "TDNN embeddings for verification/identification." },
  { name: "Faster Whisper Large-v3", role: "Speech Recognition", weight: "openai-whisper-large-v3", note: "CTranslate2 decoder for GPU/CPU inference." },
  { name: "FLAN-T5 Large", role: "Summarization", weight: "google/flan-t5-large", note: "Instruction-tuned T5 for zero-shot summaries." },
  { name: "NLLB-200", role: "Translation", weight: "facebook/nllb-200-distilled-600M", note: "200-language sequence-to-sequence translator." },
];

export default function Technology() {
  return (
    <div className="pt-28 pb-24 mx-auto max-w-6xl px-6 relative z-10" data-testid="page-technology">
      <h1 className="font-heading text-5xl font-extralight tracking-tighter">
        Every stage backed by a <span className="font-extrabold">published, replaceable</span> model.
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-3xl">
        This platform ships the architecture; you decide whether to run models locally on GPU or via cloud APIs.
      </p>

      <img
        src="https://images.pexels.com/photos/17483871/pexels-photo-17483871.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
        alt="Neural networks"
        className="mt-8 rounded-2xl w-full object-cover max-h-80"
      />

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {models.map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass p-5"
          >
            <div className="font-mono text-xs uppercase tracking-widest text-rose-500 mb-1">{m.role}</div>
            <h3 className="font-heading text-xl">{m.name}</h3>
            <div className="font-mono text-[11px] text-zinc-500 mt-1">{m.weight}</div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-300">{m.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
