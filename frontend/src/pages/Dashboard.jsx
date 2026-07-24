import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FileAudio, Clock, ChartLineUp } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) api.stats().then(setStats).catch(() => {});
  }, [user]);

  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="pt-28 pb-24 mx-auto max-w-7xl px-6 relative z-10" data-testid="page-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-extralight tracking-tighter">Welcome, <span className="font-extrabold text-cyan-500">{user?.name}</span></h1>
          <p className="text-sm text-zinc-500 mt-1">Your EchoSplit control room.</p>
        </div>
        <Link to="/upload"><Button className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">New job</Button></Link>
      </div>

      <div className="mt-8 grid md:grid-cols-4 gap-4">
        <Card icon={FileAudio} label="Files processed" value={stats?.files_processed ?? "—"} />
        <Card icon={Clock} label="Minutes processed" value={stats?.minutes_processed ?? "—"} />
        <Card icon={ChartLineUp} label="Avg processing" value={stats ? `${Math.round((stats.average_processing_ms || 0) / 1000)}s` : "—"} />
        <Card icon={FileAudio} label="Recent jobs" value={stats?.recent?.length ?? 0} />
      </div>

      <div className="mt-8 glass p-6">
        <h2 className="font-heading text-2xl">Recent jobs</h2>
        <div className="mt-4 space-y-2">
          {stats?.recent?.length ? stats.recent.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="font-mono text-xs text-zinc-500">{new Date(r.created_at).toLocaleString()}</span>
              <span className="text-sm">{r.status}</span>
              <span className="font-mono text-xs">{r.duration_seconds?.toFixed(1)}s</span>
            </div>
          )) : <div className="text-sm text-zinc-500">No jobs yet.</div>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/history"><Button variant="outline" className="rounded-full">Full history →</Button></Link>
        <Link to="/profile"><Button variant="outline" className="rounded-full">Profile</Button></Link>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value }) {
  return (
    <div className="glass p-5">
      <Icon weight="duotone" size={22} className="text-cyan-500 mb-2" />
      <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className="font-heading text-3xl mt-1">{value}</div>
    </div>
  );
}
