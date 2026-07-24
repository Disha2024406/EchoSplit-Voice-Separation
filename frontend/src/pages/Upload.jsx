import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadSimple, FileAudio, FileVideo, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { api } from "../lib/api";

const ACCEPT = ".mp3,.wav,.flac,.m4a,.mp4,.mov,.mkv,.avi";
const MAX_MB = 25;

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const pick = (f) => {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      toast.error(`File larger than ${MAX_MB}MB. Please use a shorter clip.`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    pick(e.dataTransfer.files?.[0]);
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const existingToken = localStorage.getItem("echosplit_guest_token");
      if (existingToken) formData.append("guest_token", existingToken);

      const data = await api.createJob(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      if (data.guest_token) localStorage.setItem("echosplit_guest_token", data.guest_token);
      toast.success("Upload complete — starting pipeline");
      navigate(`/processing/${data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isVideo = file && /(mp4|mov|mkv|avi)$/i.test(file.name);
  const Icon = isVideo ? FileVideo : FileAudio;

  return (
    <div className="pt-28 pb-24 mx-auto max-w-3xl px-6 relative z-10" data-testid="page-upload">
      <h1 className="font-heading text-4xl sm:text-5xl font-extralight tracking-tighter">
        Drop an audio or video file
      </h1>
      <p className="mt-3 text-zinc-500 dark:text-zinc-400">
        No account needed. Accepted formats: mp3, wav, flac, m4a, mp4, mov, mkv, avi. Max {MAX_MB}MB.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="mt-8 glass p-10 border-2 border-dashed border-white/20 dark:border-white/10 cursor-pointer text-center hover:border-cyan-500 transition-colors"
        data-testid="upload-dropzone"
      >
        <UploadSimple weight="duotone" size={40} className="mx-auto text-cyan-500 mb-4" />
        <p className="font-heading text-xl">Click or drop your file here</p>
        <p className="text-xs text-zinc-500 mt-2 font-mono">{ACCEPT}</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
          data-testid="upload-input"
        />
      </motion.div>

      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass mt-6 p-5 flex items-center gap-4" data-testid="upload-preview">
          <Icon weight="duotone" size={30} className="text-rose-500" />
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{file.name}</div>
            <div className="font-mono text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB · {isVideo ? "video" : "audio"}</div>
            {uploading && <Progress value={progress} className="mt-3 h-2" />}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setFile(null)} data-testid="upload-clear"><X /></Button>
        </motion.div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          disabled={!file || uploading}
          onClick={submit}
          className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-8"
          data-testid="upload-submit"
        >
          {uploading ? `Uploading ${progress}%` : "Start Processing"}
        </Button>
      </div>
    </div>
  );
}
