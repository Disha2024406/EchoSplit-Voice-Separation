import React from "react";
import { Link } from "react-router-dom";
import { Waveform } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Waveform weight="duotone" size={22} className="text-cyan-500" />
            <span className="font-heading font-extrabold">EchoSplit</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
            AI-powered multi-speaker voice separation, transcription, summarization and 15-language translation.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-medium mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li><Link to="/upload">Try EchoSplit</Link></li>
            <li><Link to="/technology">Technology</Link></li>
            <li><Link to="/docs">Documentation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-medium mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-medium mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-zinc-500 py-4 border-t border-white/10">
        © {new Date().getFullYear()} EchoSplit · University AI Research Project
      </div>
    </footer>
  );
}
