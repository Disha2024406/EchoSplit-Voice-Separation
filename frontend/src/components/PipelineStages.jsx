import React from "react";
import { CheckCircle, CircleDashed, Spinner, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export const STAGE_LABELS = {
  uploading: "Uploading",
  extract_audio: "Extract Audio",
  speaker_separation: "Speaker Separation",
  speaker_identification: "Speaker Identification",
  speech_recognition: "Speech Recognition",
  transcript_generation: "Transcript Generation",
  ai_summary: "AI Summary",
  translation: "Translation",
  results: "Results",
};

export default function PipelineStages({ stages, progress = {}, current }) {
  return (
    <div className="glass p-6 relative overflow-hidden">
      <div className="absolute inset-y-0 left-9 w-px bg-gradient-to-b from-cyan-500/60 via-rose-500/40 to-transparent" />
      <ol className="space-y-4 relative">
        {stages.map((key, i) => {
          const state = progress[key] || "pending";
          const isCurrent = current === key && state === "running";
          const isDone = state === "done";
          const isError = state === "error";
          const color = isDone ? "text-cyan-500" : isError ? "text-rose-500" : isCurrent ? "text-rose-500" : "text-zinc-400";
          const Icon = isDone ? CheckCircle : isError ? Warning : isCurrent ? Spinner : CircleDashed;

          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4"
              data-testid={`pipeline-stage-${key}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                  isCurrent
                    ? "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.5)]"
                    : isDone
                    ? "border-cyan-500"
                    : "border-white/10"
                } bg-white/5 backdrop-blur ${color}`}
              >
                <Icon weight={isDone ? "fill" : "regular"} size={20} className={isCurrent ? "animate-spin" : ""} />
              </div>
              <div className="flex-1">
                <div className={`font-medium ${isCurrent ? "text-rose-500" : isDone ? "text-cyan-600 dark:text-cyan-300" : ""}`}>
                  {STAGE_LABELS[key] || key}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  {state}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
