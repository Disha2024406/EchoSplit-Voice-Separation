import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, WaveTriangle, Translate, Users, Sparkle } from "@phosphor-icons/react";
import Waveform from "../components/Waveform";

const features = [
  { icon: Users, title: "Separate every voice", body: "SepFormer-powered isolation of overlapping speakers into individual channels." },
  { icon: WaveTriangle, title: "Timestamped transcripts", body: "Whisper Large-v3 aligns every word to milliseconds for dead-accurate reading." },
  { icon: Sparkle, title: "Instant AI summaries", body: "FLAN-T5 distills long-form conversations into crisp product-ready notes." },
  { icon: Translate, title: "15-language translation", body: "NLLB-200 renders summaries in Hindi, Bengali, Spanish, Tamil, Arabic and more." },
];

export default function Home() {
  return (
    <div className="pt-28 pb-24 relative z-10">
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-white/10 bg-white/40 dark:bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              University AI Research · v0.1
            </div>
            <h1 className="font-heading font-extralight text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter">
              Untangle every voice in the room.
              <span className="block font-extrabold bg-gradient-to-r from-cyan-400 via-cyan-300 to-rose-400 bg-clip-text text-transparent">
                Then read, summarize & translate them.
              </span>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
              EchoSplit is a modular pipeline of SepFormer, ECAPA-TDNN, Whisper Large-v3, FLAN-T5 and NLLB-200 —
              production-ready code, guest-friendly, and free to try.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/upload"
                data-testid="hero-try-btn"
                className="btn-pill bg-cyan-500 text-zinc-950 hover:bg-cyan-400 shadow-[0_0_40px_-8px_rgba(6,182,212,0.6)] font-semibold"
              >
                Try EchoSplit <ArrowRight weight="bold" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="glass p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">live_demo.wav</div>
                <div className="font-mono text-xs text-cyan-500">2 speakers · 42s</div>
              </div>
              <Waveform seed="hero" color="#06B6D4" bars={72} />
              <div className="grid grid-cols-2 gap-3">
                {["Speaker 1", "Speaker 2"].map((s, i) => (
                  <div key={s} className="glass-solid p-3 border">
                    <div className="text-xs font-mono text-zinc-500 mb-1">{s}</div>
                    <Waveform seed={s} color={i ? "#F43F5E" : "#06B6D4"} bars={36} />
                    <div className="font-mono text-[10px] mt-2 text-zinc-500">
                      conf {i ? 88 : 93}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass p-5"
            >
              <f.icon weight="duotone" size={26} className="text-cyan-500 mb-3" />
              <h3 className="font-heading font-medium mb-1">{f.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 mt-24 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="font-heading font-extralight text-4xl lg:text-5xl tracking-tighter">
            A pipeline that&nbsp;
            <span className="font-extrabold">respects the science.</span>
          </h2>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400">
            Every stage — separation, identification, recognition, summarization, translation — is a swappable
            service class. Plug in Faster-Whisper on your GPU, or run entirely on cloud LLMs. Same API surface.
          </p>
        </div>
        <div className="glass p-6 font-mono text-xs leading-6 whitespace-pre overflow-auto">
{`services/
├── transcription.py     # Whisper Large-v3 / whisper-1
├── separation.py        # SepFormer (WHAMR)
├── speaker_id.py        # ECAPA-TDNN
├── summarization.py     # FLAN-T5 Large / Claude 4.5
└── translation.py       # NLLB-200 / Gemini 2.5

pipeline/orchestrator.py — 8 staged transitions
workers/processor.py     — asyncio background runner`}
        </div>
      </section>
    </div>
  );
}
