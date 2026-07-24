import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // Client-only; there's no /contact endpoint on the API surface for this scaffold.
    setSent(true);
    toast.success("Thanks — we'll be in touch soon.");
    setForm({ name: "", email: "", msg: "" });
  };

  return (
    <div className="pt-28 pb-24 mx-auto max-w-3xl px-6 relative z-10" data-testid="page-contact">
      <h1 className="font-heading text-5xl font-extralight tracking-tighter">Contact</h1>
      <p className="mt-3 text-zinc-500 dark:text-zinc-400">
        Questions, collaboration ideas, or research feedback — we read everything.
      </p>
      <form onSubmit={submit} className="mt-8 glass-solid p-6 space-y-4 rounded-2xl border" data-testid="contact-form">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required data-testid="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required data-testid="contact-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="msg">Message</Label>
          <Textarea id="msg" required rows={5} data-testid="contact-msg" value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
        </div>
        <Button type="submit" className="rounded-full bg-cyan-500 text-zinc-950 hover:bg-cyan-400" data-testid="contact-submit">
          Send message
        </Button>
        {sent && <p className="text-sm text-cyan-500">Message queued locally.</p>}
      </form>
    </div>
  );
}
