import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我和这个网站。",
};

const NOW_ITEMS = [
  {
    id: "0x01",
    title: "工作",
    desc: "测试研发，FCT/IGBT 测试，上位机自动化",
    led: "led-lab",
    label: "WORK",
  },
  {
    id: "0x02",
    title: "学习",
    desc: "C、C#、Rust、Go，上位机开发、自动化测试",
    led: "led-local",
    label: "LEARN",
  },
  {
    id: "0x03",
    title: "生活",
    desc: "折腾数码、看动画、听音乐",
    led: "led-daily",
    label: "LIFE",
  },
] as const;

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      {/* 大标题锚点 */}
      <PageHeader
        label="[0x00] ABOUT"
        title="关于我"
        sub="测试工程师 · 记录生活与学习中的所思所想"
      />

      {/* 身份信息行:头像 + 名字 + 终端行(替代原左栏 sticky 信息牌) */}
      <FadeIn>
        <div className="mb-20 flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src="https://github.com/ZeniX-ally.png?size=256"
              alt="GitHub 头像"
              width={72}
              height={72}
              className="h-[4.5rem] w-[4.5rem] rounded-full border border-line object-cover"
            />
            <span
              className="led led-running absolute bottom-0.5 right-0.5 h-3 w-3 ring-2 ring-background"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="font-display text-xl font-medium">
              阿九
              <span className="text-faint"> / ZeniX-ally</span>
            </div>
            <div className="mt-1 font-mono text-xs text-muted">
              test-engineer · 0xff enthusiast
            </div>
            <div className="mt-2 font-mono text-xs text-accent">
              zenix@0xff:~$ whoami
              <span className="cursor-blink ml-0.5">▍</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 引言 */}
      <FadeIn>
        <p className="mb-20 max-w-xl border-l-2 border-accent pl-4 text-[15px] leading-relaxed text-muted">
          你好，我是阿九。一名测试工程师，方向是测试研发（FCT/IGBT 测试）。
          完美主义者，对界面有洁癖——所以这个站长这样。
        </p>
      </FadeIn>

      {/* [0x01] 这个网站 */}
      <section className="mb-20">
        <FadeIn>
          <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x01]</span>
            <h2 className="font-display text-2xl font-medium">这个网站</h2>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              THE SITE
            </span>
          </header>
        </FadeIn>
        <FadeIn delay={60}>
          <div className="max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted">
            <p>
              用来记录生活，分享学习。不追更新频率，不写没想清楚的东西。
              所有文章同时提供{" "}
              <a
                href="/feed.xml"
                className="font-mono text-[13px] text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
              >
                RSS 订阅
              </a>
              。
            </p>
            <p>
              域名{" "}
              <span className="font-mono text-[13px] text-accent">
                404-found.uk
              </span>{" "}
              是个双关：404 通常意味着「找不到」，但在这里，它找到了你。
            </p>
          </div>
        </FadeIn>
      </section>

      {/* [0x02] 我在做什么 */}
      <section className="mb-20">
        <FadeIn>
          <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x02]</span>
            <h2 className="font-display text-2xl font-medium">我在做什么</h2>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              NOW
            </span>
          </header>
        </FadeIn>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {NOW_ITEMS.map((item, i) => (
            <FadeIn key={item.id} delay={i * 60}>
              <div className="light-card flex min-h-[8.5rem] flex-col justify-between gap-2 p-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`led ${item.led}`} aria-hidden="true" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-faint">
                  <span>{item.id}</span>
                  <span>{item.label}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* [0x03] 联系 */}
      <section>
        <FadeIn>
          <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x03]</span>
            <h2 className="font-display text-2xl font-medium">联系我</h2>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              CONTACT
            </span>
          </header>
        </FadeIn>
        <FadeIn delay={60}>
          <a
            href="https://github.com/ZeniX-ally"
            target="_blank"
            rel="noopener noreferrer"
            className="light-card group flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="led led-local" aria-hidden="true" />
              <div>
                <div className="font-medium">GitHub</div>
                <div className="font-mono text-xs text-faint">
                  github.com/ZeniX-ally
                </div>
              </div>
            </div>
            <span className="font-mono text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
          <p className="mt-4 text-sm text-muted">
            文章勘误、想法交流，或单纯想打个招呼，都欢迎。
          </p>
        </FadeIn>
      </section>
    </article>
  );
}
