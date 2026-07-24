import React from "react";

const sections = [
  {
    h: "Quick start",
    body: `# clone the project
git clone <this-repo> echosplit && cd echosplit

# backend
cd backend && pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# frontend
cd ../frontend && yarn && yarn start`,
  },
  {
    h: "Environment",
    body: `backend/.env
  MONGO_URL=mongodb://localhost:27017
  DB_NAME=echosplit
  EMERGENT_LLM_KEY=<your key>
  JWT_SECRET=<random 32 bytes>

frontend/.env
  REACT_APP_BACKEND_URL=https://<your host>`,
  },
  {
    h: "Uploading (guest)",
    body: `curl -F "file=@meeting.wav" \\
     <REACT_APP_BACKEND_URL>/api/jobs`,
  },
  {
    h: "Polling a job",
    body: `curl <REACT_APP_BACKEND_URL>/api/jobs/<job_id>?guest_token=<token>`,
  },
  {
    h: "Local model integration",
    body: `Swap TranscriptionService.transcribe() with a Faster-Whisper
call. Same input/output contract, same pipeline orchestrator.`,
  },
];

export default function Documentation() {
  return (
    <div className="pt-28 pb-24 mx-auto max-w-4xl px-6 relative z-10" data-testid="page-docs">
      <h1 className="font-heading text-5xl font-extralight tracking-tighter">Documentation</h1>
      <p className="mt-3 text-zinc-500 dark:text-zinc-400">Everything you need to run EchoSplit locally.</p>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <div key={s.h} className="glass p-5">
            <h2 className="font-heading text-2xl mb-3">{s.h}</h2>
            <pre className="font-mono text-xs whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">{s.body}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
