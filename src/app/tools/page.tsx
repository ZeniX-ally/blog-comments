import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "工具清单",
  description: "自建服务与常用工具清单。",
};

type ToolStatus = "RUNNING" | "LOCAL" | "LAB" | "DAILY";

interface Tool {
  id: string;
  name: string;
  desc: string;
  status: ToolStatus;
  tag: string;
}

interface ToolSection {
  hex: string;
  title: string;
  en: string;
  tools: Tool[];
}

const SECTIONS: ToolSection[] = [
  {
    hex: "0x00",
    title: "自建服务",
    en: "SELF-HOSTED",
    tools: [
      { id: "0x01", name: "Jellyfin", desc: "家庭媒体中心 · 影视管理", status: "RUNNING", tag: "iStoreOS" },
      { id: "0x02", name: "Qdrant", desc: "知识库向量存储 · 记忆中枢", status: "RUNNING", tag: "Docker" },
      { id: "0x03", name: "OpenClash", desc: "代理 · 家里的网络出口", status: "RUNNING", tag: "iStoreOS" },
      { id: "0x04", name: "Vaultwarden", desc: "密码管理 · 替代 LastPass", status: "RUNNING", tag: "Docker" },
      { id: "0x05", name: "Radarr · Sonarr · Bazarr", desc: "影音自动化下载管理", status: "RUNNING", tag: "ARR-Stack" },
      { id: "0x06", name: "Prowlarr · qBittorrent", desc: "索引 + 下载引擎", status: "RUNNING", tag: "ARR-Stack" },
      { id: "0x07", name: "Speedtest-tracker", desc: "网速历史记录", status: "RUNNING", tag: "Docker" },
    ],
  },
  {
    hex: "0x10",
    title: "开发与工具",
    en: "DEV TOOLS",
    tools: [
      { id: "0x11", name: "VS Code", desc: "主力编辑器 · 深色主题", status: "LOCAL", tag: "editor" },
      { id: "0x12", name: "OpenCode", desc: "vibe coding 主力 · AI 辅助写码", status: "LOCAL", tag: "agent" },
      { id: "0x13", name: "git", desc: "代码版本管理", status: "LOCAL", tag: "vcs" },
      { id: "0x14", name: "Python 3.x", desc: "脚本与自动化", status: "LOCAL", tag: "lang" },
    ],
  },
  {
    hex: "0x20",
    title: "测试相关",
    en: "TEST LAB",
    tools: [
      { id: "0x21", name: "FCT / IGBT 测试", desc: "工作主战场 · 产线测试", status: "LAB", tag: "flex" },
      { id: "0x22", name: "XCP 协议", desc: "ECU 标定与测量", status: "LAB", tag: "protocol" },
      { id: "0x23", name: "上位机", desc: "与产线设备交互", status: "LAB", tag: "host-app" },
    ],
  },
  {
    hex: "0x30",
    title: "生活向",
    en: "DAILY",
    tools: [
      { id: "0x31", name: "foobar2000", desc: "本地音乐播放", status: "DAILY", tag: "audio" },
      { id: "0x32", name: "小米电视 + ADB", desc: "折腾电视装应用", status: "DAILY", tag: "tv" },
    ],
  },
];

const STATUS_META: Record<ToolStatus, { label: string; led: string }> = {
  RUNNING: { label: "RUNNING", led: "led-running" },
  LOCAL: { label: "LOCAL", led: "led-local" },
  LAB: { label: "LAB", led: "led-lab" },
  DAILY: { label: "DAILY", led: "led-daily" },
};

export default function ToolsPage() {
  const total = SECTIONS.reduce((n, s) => n + s.tools.length, 0);

  return (
    <article className="mx-auto w-full max-w-3xl pb-24 pt-16 sm:pt-20">
      <PageHeader
        label="[0x00] ARSENAL"
        title="工具清单"
        sub="自建服务与常用工具。"
      />
      {/* 终端标题行 */}
      <FadeIn>
        <div className="mb-14 font-mono text-sm">
          <span className="text-accent">zenix@0xff</span>
          <span className="text-faint">:~$</span>{" "}
          <span className="text-fg">cat arsenal.toml</span>
          <span className="cursor-blink ml-0.5 text-accent">▍</span>
        </div>
      </FadeIn>

      <div className="space-y-14">
        {SECTIONS.map((sec, si) => (
          <section key={sec.hex}>
            <FadeIn delay={si * 60}>
              <header className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-faint">[{sec.hex}]</span>
                <h2 className="font-display text-2xl font-medium">{sec.title}</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  {sec.en}
                </span>
              </header>
            </FadeIn>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sec.tools.map((t, ti) => {
                const meta = STATUS_META[t.status];
                return (
                  <FadeIn key={t.id} delay={si * 60 + ti * 40}>
                    <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-5">
                      <div className="flex items-start gap-3">
                        <span className={`led ${meta.led} mt-1.5`} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-medium leading-snug">{t.name}</span>
                            <span
                              className={`shrink-0 font-mono text-[10px] tracking-widest ${meta.led === "led-running" ? "text-accent" : "text-accent/80"}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-line pt-2.5 font-mono text-[11px] text-faint">
                        <span>{t.id}</span>
                        <span>{t.tag}</span>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* 状态栏 */}
      <FadeIn delay={200}>
        <footer className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-1 border border-line bg-surface px-4 py-2.5 font-mono text-xs text-muted">
          <span className="text-accent">●</span>
          <span>[ OK ] {total} modules loaded</span>
          <span className="text-faint">·</span>
          <span>all systems operational</span>
          <span className="ml-auto text-faint">uptime ∞</span>
        </footer>
      </FadeIn>
    </article>
  );
}
