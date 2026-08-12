"use client";

import { useEffect, useRef, useState } from "react";
import { runCommand } from "@/lib/commands";
import { sfxEnter, sfxKey } from "@/lib/sound";

type Entry = { cmd: string; output: string[] };

/**
 * 命令彩蛋输入行:终端式交互,输入 help 开始。
 * - 支持 help/whoami/ls/date/clear/0xff/ajiu
 * - 历史记录滚动展示,点击容器聚焦输入
 * - lang 控制提示与命令输出语言
 */
export function CommandLine({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [history, setHistory] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [history]);

  function submit() {
    const cmd = value.trim();
    if (!cmd) return;
    const { output, clear } = runCommand(cmd, lang);
    if (clear) {
      setHistory([]);
    } else {
      setHistory((h) => [...h, { cmd, output }]);
    }
    setValue("");
    sfxEnter();
  }

  return (
    <div
      className="terminal-box overflow-hidden rounded-lg"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <span className="led led-running h-2 w-2" aria-hidden="true" />
        <span className="font-mono text-[11px] text-faint">
          zenix@0xff — interactive
        </span>
      </div>
      <div className="max-h-56 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        <p className="text-faint">
          {lang === "zh"
            ? "输入命令,回车执行。输入 help 开始。"
            : "Type a command, press Enter. Start with help."}
        </p>
        {history.map((entry, i) => (
          <div key={i}>
            <div className="mt-2 text-fg">
              <span className="text-accent">$</span> {entry.cmd}
            </div>
            {entry.output.map((line, j) => (
              <div key={j} className="text-muted">
                {line}
              </div>
            ))}
          </div>
        ))}
        <div ref={endRef} />
        <div className="mt-2 flex items-center">
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              sfxKey();
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="ml-2 w-full bg-transparent text-fg caret-transparent outline-none placeholder:text-faint"
            placeholder="type a command…"
            aria-label="命令输入"
            autoComplete="off"
            spellCheck={false}
          />
          <span aria-hidden="true" className="cursor-blink text-accent">
            ▍
          </span>
        </div>
      </div>
    </div>
  );
}
