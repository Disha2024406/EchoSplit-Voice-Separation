import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GithubLogo } from "@phosphor-icons/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ghConfigured, setGhConfigured] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => { api.githubStatus().then((r) => setGhConfigured(r.configured)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen flex items-center justify-center px-6 relative z-10">
      <div className="glass-solid border p-8 w-full max-w-md rounded-2xl" data-testid="login-card">
        <h1 className="font-heading text-3xl font-extralight tracking-tighter">Welcome back</h1>
        <p className="text-sm text-zinc-500 mt-1">Log in to access your dashboard and history.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required data-testid="login-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required data-testid="login-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" /> or <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full"
          disabled={!ghConfigured}
          onClick={() => toast.info(ghConfigured ? "Redirecting…" : "GitHub OAuth not configured yet on this server.")}
          data-testid="login-github"
        >
          <GithubLogo weight="duotone" size={18} className="mr-2" />
          Continue with GitHub {ghConfigured ? "" : "(coming soon)"}
        </Button>
        <p className="mt-6 text-sm text-center text-zinc-500">
          No account? <Link to="/signup" className="text-cyan-500">Create one</Link>
        </p>
      </div>
    </div>
  );
}
