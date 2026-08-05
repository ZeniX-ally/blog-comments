import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { github, email, rss } = site.links;

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="flex w-full flex-col gap-3 px-5 py-8 text-sm text-faint sm:flex-row sm:items-baseline sm:justify-between sm:px-8 md:px-12 xl:px-16">
        <p>
          © {year} {site.name} · 用 <a href="https://nextjs.org" className="underline decoration-line underline-offset-4 transition-colors hover:text-foreground">Next.js</a> 构建
        </p>
        <div className="flex gap-5">
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              GitHub
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="transition-colors hover:text-foreground">
              邮箱
            </a>
          )}
          {rss && (
            <a href={rss} className="transition-colors hover:text-foreground">
              RSS
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
