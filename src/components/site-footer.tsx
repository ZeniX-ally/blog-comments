import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { github, email, rss } = site.links;

  return (
    <footer className="mt-auto border-t border-line">
      <div className="flex w-full flex-col gap-3 px-5 py-8 text-sm text-faint sm:flex-row sm:items-baseline sm:justify-between sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <p className="flex items-center gap-2.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-xs text-muted">0xff.zone</span>
          <span className="text-faint/80">· © {year} {site.name}</span>
        </p>
        {/* 右侧链接组右 padding 避让右下角固定按钮(BackToTop),防止滚动到底时被遮挡 */}
        <div className="flex gap-5 sm:pr-16">
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-foreground">
              GitHub
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="transition-colors duration-300 hover:text-foreground">
              Email
            </a>
          )}
          {rss && (
            <a href={rss} className="transition-colors duration-300 hover:text-foreground">
              RSS
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
