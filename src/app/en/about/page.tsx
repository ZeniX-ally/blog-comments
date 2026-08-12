import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";

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
    <article className="mx-auto w-full max-w-4xl py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center gap-5 lg:flex-col lg:items-start lg:gap-0">
              <div className="relative shrink-0 lg:mb-6">
                <img
                  src="https://github.com/ZeniX-ally.png?size=256"
                  alt="GitHub avatar"
                  width={112}
                  height={112}
                  className="h-24 w-24 rounded-full border-2 border-accent/50 object-cover lg:h-28 lg:w-28"
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
          </aside>
        </FadeIn>

        <div className="min-w-0 space-y-12">
          <FadeIn>
            <p className="border-l-2 border-accent pl-4 text-[15px] leading-relaxed text-muted">
              Hi, I'm Ajiu. A test engineer focused on test R&amp;D (FCT/IGBT testing).
              A perfectionist with a clean-interface obsession — hence this site.
            </p>
          </FadeIn>

          <section>
            <FadeIn>
              <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
                <span className="font-mono text-xs text-faint">[0x01]</span>
                <h2 className="font-display text-xl font-medium">The Site</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  THE SITE
                </span>
              </header>
            </FadeIn>
            <FadeIn delay={60}>
              <div className="space-y-3 text-[15px] leading-relaxed text-muted">
                <p>
                  A place to record life and share what I learn. All posts also come with{" "}
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
                  is a pun: 404 usually means "not found" — but here, it found you.
                </p>
              </div>
            </FadeIn>
          </section>

          <section>
            <FadeIn>
              <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
                <span className="font-mono text-xs text-faint">[0x02]</span>
                <h2 className="font-display text-xl font-medium">What I'm Doing</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  NOW
                </span>
              </header>
            </FadeIn>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {NOW_ITEMS.map((item, i) => (
                <FadeIn key={item.id} delay={i * 60}>
                  <TiltCard className="h-full">
                    <div className="tool-card flex min-h-[9.5rem] flex-col justify-between gap-2 rounded-lg p-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className={`led ${item.led}`} aria-hidden="true" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-muted">
                          {item.desc}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-line/80 pt-2 font-mono text-[11px] text-faint">
                        <span>{item.id}</span>
                        <span>{item.label}</span>
                      </div>
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          </section>

          <section>
            <FadeIn>
              <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
                <span className="font-mono text-xs text-faint">[0x03]</span>
                <h2 className="font-display text-xl font-medium">Contact</h2>
                <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                  CONTACT
                </span>
              </header>
            </FadeIn>
            <FadeIn delay={60}>
              <TiltCard>
                <a
                  href="https://github.com/ZeniX-ally"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tool-card group flex items-center justify-between gap-4 rounded-lg px-4 py-3.5"
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
                  <span className="font-mono text-sm text-accent transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              </TiltCard>
              <p className="mt-3 text-sm text-muted">
                Corrections, ideas, or just a hello — all welcome.
              </p>
            </FadeIn>
          </section>
        </div>
      </div>
    </article>
  );
}
