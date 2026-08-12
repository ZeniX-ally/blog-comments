"use client";

import { useEffect, useState } from "react";
import { isSfxEnabled, setSfxEnabled } from "@/lib/sound";

/** 音效开关:默认关闭,点击后创建 AudioContext(需用户手势解锁) */
export function SfxToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOn(isSfxEnabled());
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isSfxEnabled();
    setSfxEnabled(next);
    setOn(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "关闭音效" : "开启音效"}
      title={on ? "关闭音效" : "开启音效"}
      className={`inline-flex items-center transition-colors hover:text-accent ${
        on ? "text-accent" : "text-muted"
      }`}
    >
      {mounted && on ? <VolumeOnIcon /> : <VolumeOffIcon />}
    </button>
  );
}

/** 喇叭 + 声波(音效开) */
function VolumeOnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** 喇叭 + 斜杠(音效关) */
function VolumeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
