import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import "./globals.css";

const umamiEnabled = Boolean(site.umami.scriptSrc && site.umami.websiteId);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "zh_CN",
    type: "website",
    images: ["/og/default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og/default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 性能:预载标题(Sans)与正文(Serif)字体;Mono 只用于小标签,按需加载 */}
        <link rel="preload" href="/fonts/anthropic-sans-roman.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/anthropic-serif-roman.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* favicon:手动引用 public/ 文件,避免 Next 约定注入带 hash query 的 URL
            (Cloudflare Pages 对带 query 的静态文件请求返回 404) */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9f5" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />
        {umamiEnabled && (
          <script
            defer
            src={site.umami.scriptSrc}
            data-website-id={site.umami.websiteId}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        {/* 顶栏为 sticky、占文档流,main 不再需要顶部留白;各页用 .content 控制栏宽与左右内边距 */}
        <main className="grow">{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
