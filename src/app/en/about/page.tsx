import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "About me and this site.",
};

const NOW_ITEMS = [
  {
    id: "0x01",
    title: "Work",
    desc: "Test R&D, FCT/IGBT testing, host-PC automation",
    led: "led-lab",
    label: "WORK",
  },
  {
    id: "0x02",
    title: "Learning",
    desc: "C, C#, Rust, Go — host-PC dev, automated testing",
    led: "led-local",
    label: "LEARN",
  },
  {
    id: "0x03",
    title: "Life",
    desc: "Tinkering with gadgets, anime, music",
    led: "led-daily",
    label: "LIFE",
  },
] as const;

export default function AboutPageEn() {
  return (
    <article className="mx-auto w-full max-w-3xl pb-32 pt-20 sm:pt-24">
      {/* 大标题锚点 */}
      <PageHeader
        label="[0x00] ABOUT"
        title="About"
        sub="Test engineer · documenting life and the things I learn"
      />

      {/* 身份信息行:头像 + 名字 + 终端行(替代原左栏 sticky 信息牌) */}
      <FadeIn>
        <div className="mb-20 flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src="https://github.com/ZeniX-ally.png?size=256"
              alt="GitHub avatar"
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
              Ajiu
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
          Hi, I&apos;m Ajiu. A test engineer focused on test R&amp;D (FCT/IGBT testing).
          A perfectionist with a clean-interface obsession — hence this site.
        </p>
      </FadeIn>

      {/* [0x01] 这个网站 */}
      <section className="mb-20">
        <FadeIn>
          <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x01]</span>
            <h2 className="font-display text-2xl font-medium">The Site</h2>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              THE SITE
            </span>
          </header>
        </FadeIn>
        <FadeIn delay={60}>
          <div className="space-y-3 text-[15px] leading-relaxed text-muted">
            <p>
              A place to record life and share what I learn. All posts also come
              with{" "}
              <a
                href="/feed.xml"
                className="font-mono text-[13px] text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
              >
                RSS
              </a>
              .
            </p>
            <p>
              The domain{" "}
              <span className="font-mono text-[13px] text-accent">
                404-found.uk
              </span>{" "}
              is a pun: 404 usually means &quot;not found&quot; — but here, it found
              you.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* [0x02] 我在做什么 */}
      <section className="mb-20">
        <FadeIn>
          <header className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x02]</span>
            <h2 className="font-display text-2xl font-medium">What I&apos;m Doing</h2>
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
            <h2 className="font-display text-2xl font-medium">Contact</h2>
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
            Corrections, ideas, or just a hello — all welcome.
          </p>
        </FadeIn>
      </section>
    </article>
  );
}
