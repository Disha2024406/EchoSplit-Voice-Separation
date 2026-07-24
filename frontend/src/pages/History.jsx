import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Trash, MagnifyingGlass, ArrowsClockwise } from "@phosphor-icons/react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const guestToken = localStorage.getItem("echosplit_guest_token");
      const rows = await api.listJobs(user ? undefined : guestToken);
      setItems(rows);
    } catch (e) { toast.error("Failed to load history"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const del = async (id) => {
    try {
      const guestToken = localStorage.getItem("echosplit_guest_token");
      await api.deleteJob(id, user ? undefined : guestToken);
      setItems((its) => its.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  const filtered = items.filter((i) => i.filename?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pt-28 pb-24 mx-auto max-w-6xl px-6 relative z-10" data-testid="page-history">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-extralight tracking-tighter">History</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {user ? "Permanent, cloud-synced." : "Guest mode — history lives only in your browser session."}
          </p>
        </div>
        <Button variant="ghost" className="rounded-full" onClick={load} data-testid="history-refresh"><ArrowsClockwise className="mr-1" size={16}/> Refresh</Button>
      </div>

      <div className="mt-6 glass p-3 flex items-center gap-2">
        <MagnifyingGlass className="text-zinc-500 ml-2" size={16} />
        <Input placeholder="Search by filename" value={q} onChange={(e) => setQ(e.target.value)} className="border-0 bg-transparent focus-visible:ring-0" data-testid="history-search" />
      </div>

      <div className="mt-6 space-y-3">
        {loading && <div className="glass p-6 animate-pulse text-zinc-500 text-sm">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="glass p-6 text-zinc-500 text-sm">No jobs yet. <Link to="/upload" className="text-cyan-500">Upload something.</Link></div>}
        {filtered.map((j) => (
          <div key={j.id} className="glass p-4 flex items-center gap-4" data-testid={`history-row-${j.id}`}>
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{j.filename}</div>
              <div className="font-mono text-xs text-zinc-500">
                {new Date(j.created_at).toLocaleString()} · {j.status} · {j.speakers?.length || 0} spk
              </div>
            </div>
            <Link to={`/results/${j.id}`}><Button variant="outline" size="sm" className="rounded-full">Reopen</Button></Link>
            <Button variant="ghost" size="icon" onClick={() => del(j.id)} data-testid={`history-delete-${j.id}`}><Trash /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
