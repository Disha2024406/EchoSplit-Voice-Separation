import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DownloadSimple, Translate, ArrowLeft, ClockCounterClockwise, Cpu } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Waveform from "../components/Waveform";
import SpeakerCard from "../components/SpeakerCard";
import { api, downloadUrl, mediaUrl } from "../lib/api";

export default function Results() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    api.languages().then((r) => setLanguages(r.languages));
    const guestToken = localStorage.getItem("echosplit_guest_token");
    api.getJob(jobId, guestToken).then(setJob).catch(() => toast.error("Job not found"));
  }, [jobId]);

  const translate = async () => {
    setTranslating(true);
    try {
      const guestToken = localStorage.getItem("echosplit_guest_token");
      const { text } = await api.translate(jobId, selectedLang, guestToken);
      setJob((j) => ({ ...j, translations: { ...(j?.translations || {}), [selectedLang]: text } }));
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Translation failed");
    } finally { setTranslating(false); }
  };

  if (!job) {
    return <div className="pt-28 mx-auto max-w-4xl px-6"><div className="glass p-10 animate-pulse">Loading results…</div></div>;
  }

  const translatedText = job.translations?.[selectedLang] || "";

  return (
    <div className="pt-28 pb-24 mx-auto max-w-7xl px-6 relative z-10" data-testid="page-results">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link to="/upload" className="text-xs font-mono text-zinc-500 flex items-center gap-2 hover:text-cyan-500">
            <ArrowLeft size={14} /> new job
          </Link>
          <h1 className="mt-2 font-heading text-4xl font-extralight tracking-tighter">
            <span className="font-extrabold text-cyan-500">{job.speakers?.length || 0}</span> speakers ·{" "}
            <span className="text-zinc-500">{job.filename}</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <a href={downloadUrl(jobId, "transcript.txt")} target="_blank" rel="noreferrer">
            <Button variant="outline" className="rounded-full" data-testid="download-transcript"><DownloadSimple className="mr-1" size={16}/> Transcript</Button>
          </a>
          <a href={downloadUrl(jobId, "summary.pdf")} target="_blank" rel="noreferrer">
            <Button variant="outline" className="rounded-full" data-testid="download-summary"><DownloadSimple className="mr-1" size={16}/> Summary PDF</Button>
          </a>
          <a href={downloadUrl(jobId, "results.json")} target="_blank" rel="noreferrer">
            <Button variant="outline" className="rounded-full" data-testid="download-json"><DownloadSimple className="mr-1" size={16}/> JSON</Button>
          </a>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mt-8 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-xs uppercase tracking-widest text-cyan-500">Full mix waveform</div>
          <div className="font-mono text-xs text-zinc-500">
            {job.duration_seconds?.toFixed(1) || "0.0"}s · {job.processing_ms || 0}ms
          </div>
        </div>
        <Waveform seed={jobId} color="#06B6D4" bars={96} />
        {job.source_url && (
          <audio src={mediaUrl(job.source_url)} controls className="mt-4 w-full" data-testid="results-audio" />
        )}
      </motion.div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        {job.speakers?.map((sp, i) => (
          <SpeakerCard key={i} speaker={sp} index={i} sourceUrl={job.source_url} />
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="transcript">
            <TabsList data-testid="results-tabs">
              <TabsTrigger value="transcript" data-testid="tab-transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
              <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript">
              <div className="glass p-5 mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200" data-testid="transcript-content">
                {job.transcript || "No transcript available."}
              </div>
            </TabsContent>
            <TabsContent value="summary">
              <div className="glass p-5 mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200" data-testid="summary-content">
                {job.summary || "No summary available."}
              </div>
            </TabsContent>
            <TabsContent value="timeline">
              <div className="glass p-5 mt-2 max-h-[420px] overflow-y-auto text-sm space-y-2" data-testid="timeline-content">
                {job.transcript_segments?.length
                  ? job.transcript_segments.map((s, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="font-mono text-[10px] text-zinc-400 w-14 shrink-0">
                          {(s.start ?? 0).toFixed(1)}s
                        </span>
                        <span>{s.text?.trim()}</span>
                      </div>
                    ))
                  : "No timeline segments."}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-5" data-testid="translate-panel">
            <div className="flex items-center gap-2 mb-3">
              <Translate weight="duotone" size={20} className="text-rose-500" />
              <span className="font-heading">Translate summary</span>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="rounded-full" data-testid="translate-lang"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {languages.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="rounded-full bg-rose-500 hover:bg-rose-400 text-zinc-950" onClick={translate} disabled={translating} data-testid="translate-run">
                {translating ? "…" : "Run"}
              </Button>
            </div>
            <div className="mt-4 text-sm whitespace-pre-wrap min-h-24 text-zinc-700 dark:text-zinc-200" data-testid="translation-output">
              {translatedText || <span className="text-zinc-400">Choose a language and click Run.</span>}
            </div>
          </div>

          <div className="glass p-5" data-testid="stats-panel">
            <div className="flex items-center gap-2 mb-3">
              <ClockCounterClockwise weight="duotone" size={20} className="text-cyan-500" />
              <span className="font-heading">Processing timeline</span>
            </div>
            <ul className="space-y-1 font-mono text-xs">
              {Object.entries(job.stage_progress || {}).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="text-zinc-500">{k}</span>
                  <span className={v === "done" ? "text-cyan-500" : v === "error" ? "text-rose-500" : "text-zinc-400"}>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass p-5" data-testid="model-info-panel">
            <div className="flex items-center gap-2 mb-3">
              <Cpu weight="duotone" size={20} className="text-rose-500" />
              <span className="font-heading">Model information</span>
            </div>
            <ul className="space-y-1 font-mono text-xs">
              {Object.entries(job.model_info || {}).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="text-zinc-500">{k}</span>
                  <span className="truncate">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
