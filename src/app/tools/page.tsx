import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "工具清单",
  description: "自建服务与常用工具清单。",
  path: "/tools",
});

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
      { name: "Jellyfin", desc: "家庭媒体中心 · 影视管理", status: "RUNNING", tag: "iStoreOS" },
      { name: "Qdrant", desc: "知识库向量存储 · 记忆中枢", status: "RUNNING", tag: "Docker" },
      { name: "OpenClash", desc: "代理 · 家里的网络出口", status: "RUNNING", tag: "iStoreOS" },
      { name: "Vaultwarden", desc: "密码管理 · 替代 LastPass", status: "RUNNING", tag: "Docker" },
      { name: "Radarr · Sonarr · Bazarr", desc: "影音自动化下载管理", status: "RUNNING", tag: "ARR-Stack" },
      { name: "Prowlarr · qBittorrent", desc: "索引 + 下载引擎", status: "RUNNING", tag: "ARR-Stack" },
      { name: "Speedtest-tracker", desc: "网速历史记录", status: "RUNNING", tag: "Docker" },
    ],
  },
  {
    title: "开发与工具",
    en: "Dev tools",
    tools: [
      { name: "VS Code", desc: "主力编辑器 · 深色主题", status: "LOCAL", tag: "editor" },
      { name: "OpenCode", desc: "vibe coding 主力 · AI 辅助写码", status: "LOCAL", tag: "agent" },
      { name: "git", desc: "代码版本管理", status: "LOCAL", tag: "vcs" },
      { name: "Python 3.x", desc: "脚本与自动化", status: "LOCAL", tag: "lang" },
    ],
  },
  {
    title: "测试相关",
    en: "Test lab",
    tools: [
      { name: "FCT / IGBT 测试", desc: "工作主战场 · 产线测试", status: "LAB", tag: "flex" },
      { name: "XCP 协议", desc: "ECU 标定与测量", status: "LAB", tag: "protocol" },
      { name: "上位机", desc: "与产线设备交互", status: "LAB", tag: "host-app" },
    ],
  },
  {
    title: "生活向",
    en: "Daily",
    tools: [
      { name: "foobar2000", desc: "本地音乐播放", status: "DAILY", tag: "audio" },
      { name: "小米电视 + ADB", desc: "折腾电视装应用", status: "DAILY", tag: "tv" },
    ],
  },
];

const STATUS_META: Record<ToolStatus, { label: string; dot: string }> = {
  RUNNING: { label: "运行中", dot: "dot-running" },
  LOCAL: { label: "本机", dot: "dot-local" },
  LAB: { label: "工作", dot: "dot-lab" },
  DAILY: { label: "日常", dot: "dot-daily" },
};

export default function ToolsPage() {
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
              工具清单
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              自建服务与常用工具。
            </p>
            <div className="mt-8 text-xs text-faint">{total} 项工具</div>
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
