import React, { useRef, useState } from "react";
import { Play, Pause, DownloadSimple, UserCircle } from "@phosphor-icons/react";
import Waveform from "./Waveform";
import { Button } from "./ui/button";
import { mediaUrl } from "../lib/api";

export default function SpeakerCard({ speaker, index, sourceUrl }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const audioSrc = speaker.audio_url ? mediaUrl(speaker.audio_url) : sourceUrl ? mediaUrl(sourceUrl) : null;
  const confidence = Math.round((speaker.confidence || 0) * 100);
  const color = index % 2 === 0 ? "#06B6D4" : "#F43F5E";

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  return (
    <div className="glass p-5 space-y-4" data-testid={`speaker-card-${index}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: `${color}22`, color }}
          >
            <UserCircle weight="duotone" size={26} />
          </div>
          <div>
            <div className="font-heading font-medium">{speaker.label}</div>
            <div className="font-mono text-xs text-zinc-500">
              conf {confidence}% · {speaker.duration_seconds?.toFixed(1) || "0.0"}s
            </div>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggle}
          data-testid={`speaker-play-${index}`}
          className="rounded-full"
          disabled={!audioSrc}
        >
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </Button>
      </div>

      <Waveform seed={speaker.label + index} color={color} />

      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}

      {speaker.utterances?.length ? (
        <div className="text-sm text-zinc-600 dark:text-zinc-300 max-h-28 overflow-y-auto pr-1">
          {speaker.utterances.slice(0, 6).map((u, i) => (
            <p key={i}>
              <span className="font-mono text-[10px] text-zinc-400 mr-2">
                {u.start?.toFixed(1)}s
              </span>
              {u.text}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
