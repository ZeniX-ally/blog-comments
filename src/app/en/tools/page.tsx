import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Tools",
  description: "Self-hosted services and everyday tools.",
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
    title: "Self-Hosted",
    en: "SELF-HOSTED",
    tools: [
      { id: "0x01", name: "Jellyfin", desc: "Home media center", status: "RUNNING", tag: "iStoreOS" },
      { id: "0x02", name: "Qdrant", desc: "Vector store for knowledge base", status: "RUNNING", tag: "Docker" },
      { id: "0x03", name: "OpenClash", desc: "Proxy · home network exit", status: "RUNNING", tag: "iStoreOS" },
      { id: "0x04", name: "Vaultwarden", desc: "Password manager", status: "RUNNING", tag: "Docker" },
      { id: "0x05", name: "Radarr · Sonarr · Bazarr", desc: "Media automation downloads", status: "RUNNING", tag: "ARR-Stack" },
      { id: "0x06", name: "Prowlarr · qBittorrent", desc: "Indexer + download engine", status: "RUNNING", tag: "ARR-Stack" },
      { id: "0x07", name: "Speedtest-tracker", desc: "Speed history records", status: "RUNNING", tag: "Docker" },
    ],
  },
  {
    hex: "0x10",
    title: "Dev Tools",
    en: "DEV TOOLS",
    tools: [
      { id: "0x11", name: "VS Code", desc: "Main editor · dark theme", status: "LOCAL", tag: "editor" },
      { id: "0x12", name: "OpenCode", desc: "Vibe coding · AI-assisted", status: "LOCAL", tag: "agent" },
      { id: "0x13", name: "git", desc: "Version control", status: "LOCAL", tag: "vcs" },
      { id: "0x14", name: "Python 3.x", desc: "Scripting and automation", status: "LOCAL", tag: "lang" },
    ],
  },
  {
    hex: "0x20",
    title: "Test Lab",
    en: "TEST LAB",
    tools: [
      { id: "0x21", name: "FCT / IGBT Testing", desc: "Main battlefield · line testing", status: "LAB", tag: "flex" },
      { id: "0x22", name: "XCP Protocol", desc: "ECU calibration & measurement", status: "LAB", tag: "protocol" },
      { id: "0x23", name: "Host-PC Apps", desc: "Interacting with line equipment", status: "LAB", tag: "host-app" },
    ],
  },
  {
    hex: "0x30",
    title: "Daily",
    en: "DAILY",
    tools: [
      { id: "0x31", name: "foobar2000", desc: "Local music player", status: "DAILY", tag: "audio" },
      { id: "0x32", name: "Xiaomi TV + ADB", desc: "Tinkering with TV apps", status: "DAILY", tag: "tv" },
    ],
  },
];

const STATUS_META: Record<ToolStatus, { label: string; led: string }> = {
  RUNNING: { label: "RUNNING", led: "led-running" },
  LOCAL: { label: "LOCAL", led: "led-local" },
  LAB: { label: "LAB", led: "led-lab" },
  DAILY: { label: "DAILY", led: "led-daily" },
};

export default function ToolsPageEn() {
  const total = SECTIONS.reduce((n, s) => n + s.tools.length, 0);

  return (
    <article className="mx-auto w-full max-w-3xl pb-32 pt-20 sm:pt-24">
      <PageHeader
        label="[0x00] ARSENAL"
        title="Toolbox"
        sub="Self-hosted services and everyday tools."
      />
      <FadeIn>
        <div className="mb-20 font-mono text-sm">
          <span className="text-accent">zenix@0xff</span>
          <span className="text-faint">:~$</span>{" "}
          <span className="text-fg">cat arsenal.toml</span>
          <span className="cursor-blink ml-0.5 text-accent">▍</span>
        </div>
      </FadeIn>

      <div className="space-y-20">
        {SECTIONS.map((sec, si) => (
          <section key={sec.hex}>
            <FadeIn delay={si * 60}>
              <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-faint">[{sec.hex}]</span>
                <h2 className="font-display text-2xl font-medium">{sec.title}</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  {sec.en}
                </span>
              </header>
            </FadeIn>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {sec.tools.map((t, ti) => {
                const meta = STATUS_META[t.status];
                return (
                  <FadeIn key={t.id} delay={si * 60 + ti * 40}>
                    <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-6">
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
                      <div className="flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-faint">
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

      <FadeIn delay={200}>
        <footer className="mt-20 flex flex-wrap items-center gap-x-3 gap-y-1 border border-line bg-surface px-4 py-2.5 font-mono text-xs text-muted">
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
