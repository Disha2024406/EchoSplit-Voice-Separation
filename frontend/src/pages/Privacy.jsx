import React from "react";

export default function Privacy() {
  return (
    <div className="pt-28 pb-24 mx-auto max-w-3xl px-6 relative z-10" data-testid="page-privacy">
      <h1 className="font-heading text-4xl font-extralight tracking-tighter">Privacy Policy</h1>
      <div className="glass p-6 mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
        <p>We treat uploaded audio and video as private and process it only to produce your requested outputs — separation, transcription, summarization and translation.</p>
        <p>Guest data lives only in your browser via a local guest token. Registered users' data is stored in our MongoDB instance and can be deleted at any time from the History page.</p>
        <p>We use the Emergent Universal LLM key to route transcription (OpenAI Whisper), summarization (Claude), and translation (Gemini) requests. No third-party training on your data is initiated by EchoSplit.</p>
        <p>Contact the maintainers via the Contact page for takedown or export requests.</p>
      </div>
    </div>
  );
}
