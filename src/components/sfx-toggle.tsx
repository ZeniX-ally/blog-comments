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
      className="font-mono text-xs text-faint transition-colors hover:text-accent"
    >
      {mounted ? (on ? "sfx:on" : "sfx:off") : "sfx:off"}
    </button>
  );
}
