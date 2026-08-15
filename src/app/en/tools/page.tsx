import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "Tools",
  description: "Self-hosted services and everyday tools.",
};

type ToolStatus = "RUNNING" | "LOCAL" | "LAB" | "DAILY";

interface Tool {
  name: string;
  desc: string;
  status: ToolStatus;
  tag: string;
}

interface ToolSection {
  title: string;
  en: string;
  tools: Tool[];
}

const SECTIONS: ToolSection[] = [
  {
    title: "自建服务",
    en: "Self-hosted",
    tools: [
      { name: "Jellyfin", desc: "Home media center", status: "RUNNING", tag: "iStoreOS" },
      { name: "Qdrant", desc: "Vector store for knowledge base", status: "RUNNING", tag: "Docker" },
      { name: "OpenClash", desc: "Proxy · home network exit", status: "RUNNING", tag: "iStoreOS" },
      { name: "Vaultwarden", desc: "Password manager", status: "RUNNING", tag: "Docker" },
      { name: "Radarr · Sonarr · Bazarr", desc: "Media automation downloads", status: "RUNNING", tag: "ARR-Stack" },
      { name: "Prowlarr · qBittorrent", desc: "Indexer + download engine", status: "RUNNING", tag: "ARR-Stack" },
      { name: "Speedtest-tracker", desc: "Speed history records", status: "RUNNING", tag: "Docker" },
    ],
  },
  {
    title: "开发与工具",
    en: "Dev tools",
    tools: [
      { name: "VS Code", desc: "Main editor · dark theme", status: "LOCAL", tag: "editor" },
      { name: "OpenCode", desc: "Vibe coding · AI-assisted", status: "LOCAL", tag: "agent" },
      { name: "git", desc: "Version control", status: "LOCAL", tag: "vcs" },
      { name: "Python 3.x", desc: "Scripting and automation", status: "LOCAL", tag: "lang" },
    ],
  },
  {
    title: "测试相关",
    en: "Test lab",
    tools: [
      { name: "FCT / IGBT Testing", desc: "Main battlefield · line testing", status: "LAB", tag: "flex" },
      { name: "XCP Protocol", desc: "ECU calibration & measurement", status: "LAB", tag: "protocol" },
      { name: "Host-PC Apps", desc: "Interacting with line equipment", status: "LAB", tag: "host-app" },
    ],
  },
  {
    title: "生活向",
    en: "Daily",
    tools: [
      { name: "foobar2000", desc: "Local music player", status: "DAILY", tag: "audio" },
      { name: "Xiaomi TV + ADB", desc: "Tinkering with TV apps", status: "DAILY", tag: "tv" },
    ],
  },
];

const STATUS_META: Record<ToolStatus, { label: string; dot: string }> = {
  RUNNING: { label: "运行中", dot: "dot-running" },
  LOCAL: { label: "本机", dot: "dot-local" },
  LAB: { label: "工作", dot: "dot-lab" },
  DAILY: { label: "日常", dot: "dot-daily" },
};

export default function ToolsPageEn() {
  const total = SECTIONS.reduce((n, s) => n + s.tools.length, 0);

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">工具</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Tools
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Self-hosted services and everyday tools.
            </p>
            <div className="mt-8 text-xs text-faint">{total} tools</div>
          </aside>
        </FadeIn>

        {/* 右栏:工具分区 */}
        <div className="min-w-0 pb-10">
          <div className="space-y-20">
            {SECTIONS.map((sec, si) => (
              <section key={sec.title}>
                <FadeIn delay={si * 60}>
                  <header className="mb-8">
                    <h2 className="font-display text-2xl font-medium">{sec.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-faint">
                      {sec.en}
                    </p>
                  </header>
                </FadeIn>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {sec.tools.map((t, ti) => {
                    const meta = STATUS_META[t.status];
                    return (
                      <FadeIn key={t.name} delay={si * 60 + ti * 40}>
                        <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-6">
                          <div className="flex items-start gap-3">
                            <span className={`dot ${meta.dot} mt-1.5`} aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium leading-snug">{t.name}</span>
                                <span className="shrink-0 text-[10px] text-faint">
                                  {meta.label}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {t.desc}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-line pt-3 text-[11px] text-faint">
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
        </div>
      </div>
      </article>
    </BookTransition>
  );
}
