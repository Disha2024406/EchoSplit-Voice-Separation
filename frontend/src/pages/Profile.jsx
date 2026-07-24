import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  if (!loading && !user) return <Navigate to="/login" replace />;

  return (
    <div className="pt-28 pb-24 mx-auto max-w-2xl px-6 relative z-10" data-testid="page-profile">
      <h1 className="font-heading text-4xl font-extralight tracking-tighter">Profile</h1>
      <div className="glass-solid border p-6 mt-6 space-y-4 rounded-2xl">
        <Row k="Name" v={user?.name} />
        <Row k="Email" v={user?.email} />
        <Row k="Provider" v={user?.provider} />
        <Row k="User ID" v={<span className="font-mono text-xs">{user?.id}</span>} />
      </div>
      <div className="mt-6">
        <Button variant="destructive" className="rounded-full" onClick={logout} data-testid="profile-logout">Sign out</Button>
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex justify-between border-b border-zinc-200/60 dark:border-white/10 pb-3 last:border-0">
      <span className="text-zinc-500">{k}</span>
      <span>{v}</span>
    </div>
  );
}
