import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { github, email, rss } = site.links;

  return (
    <footer className="mt-auto border-t border-line">
      <div className="flex w-full flex-col gap-3 px-5 py-8 text-sm text-faint sm:flex-row sm:items-baseline sm:justify-between sm:px-12 md:px-16 lg:px-20 xl:px-24">
        <p className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-muted"
            aria-hidden="true"
          >
            <path d="M12 12
                     C 12 7.5 14.5 5 17 5
                     C 19.5 5 21.5 7 21.5 9.5
                     C 21.5 12 19.5 14 17 14
                     C 14.5 14 13 12.5 12 12
                     C 11 10.5 9.5 9 7 9
                     C 4.5 9 2.5 11 2.5 13.5
                     C 2.5 16 4.5 18 7 18
                     C 9.5 18 11 16.5 12 12" />
          </svg>
          <span className="text-faint/80">© {year} {site.name}</span>
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
