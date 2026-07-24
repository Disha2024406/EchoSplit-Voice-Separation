import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PipelineStages from "../components/PipelineStages";
import { api } from "../lib/api";

export default function Processing() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [stages, setStages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { api.stages().then((r) => setStages(r.stages)); }, []);

  useEffect(() => {
    let stop = false;
    const guestToken = localStorage.getItem("echosplit_guest_token");
    async function tick() {
      try {
        const j = await api.getJob(jobId, guestToken);
        if (stop) return;
        setJob(j);
        if (j.status === "done") { navigate(`/results/${jobId}`); return; }
        if (j.status === "failed") { toast.error(j.error || "Pipeline failed"); return; }
      } catch (e) {
        toast.error("Could not load job");
      }
      if (!stop) setTimeout(tick, 1500);
    }
    tick();
    return () => { stop = true; };
  }, [jobId, navigate]);

  return (
    <div className="pt-28 pb-24 mx-auto max-w-4xl px-6 relative z-10" data-testid="page-processing">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl font-extralight tracking-tighter">
        Processing your <span className="font-extrabold text-cyan-500">{job?.filename || "file"}</span>
      </motion.h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Live pipeline — this can take up to a minute depending on file length.
      </p>
      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          {stages.length > 0 && (
            <PipelineStages stages={stages} progress={job?.stage_progress || {}} current={job?.current_stage} />
          )}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-5">
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-500 mb-2">Status</div>
            <div className="font-heading text-2xl">{job?.status || "queued"}</div>
            {job?.error && <p className="text-sm text-rose-500 mt-2">{job.error}</p>}
          </div>
          <div className="glass p-5">
            <div className="font-mono text-xs uppercase tracking-widest text-rose-500 mb-2">Job ID</div>
            <div className="font-mono text-xs break-all">{jobId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
