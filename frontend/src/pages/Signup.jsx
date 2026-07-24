import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen flex items-center justify-center px-6 relative z-10">
      <div className="glass-solid border p-8 w-full max-w-md rounded-2xl" data-testid="signup-card">
        <h1 className="font-heading text-3xl font-extralight tracking-tighter">Create your account</h1>
        <p className="text-sm text-zinc-500 mt-1">Save history and results across devices.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required data-testid="signup-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required data-testid="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} data-testid="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} data-testid="signup-submit" className="w-full rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950">
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-zinc-500">
          Already a member? <Link to="/login" className="text-cyan-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
