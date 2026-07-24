import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="pt-40 pb-24 mx-auto max-w-xl px-6 text-center relative z-10" data-testid="page-404">
      <h1 className="font-heading text-8xl font-extrabold text-cyan-500">404</h1>
      <p className="mt-4 text-zinc-500">This page slipped through the pipeline.</p>
      <Link to="/"><Button className="mt-6 rounded-full bg-cyan-500 text-zinc-950 hover:bg-cyan-400">Take me home</Button></Link>
    </div>
  );
}
