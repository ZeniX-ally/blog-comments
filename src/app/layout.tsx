import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackToTop } from "@/components/back-to-top";
import { BackButton } from "@/components/back-button";
import { EffectLayer } from "@/components/effect-layer";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var m=document.querySelector('meta[name="theme-color"]');if(m){var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);m.setAttribute('content',dark?'#191919':'#ffffff');}}catch(e){}})();`;

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
    siteName: site.name,
    images: ["/og/default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 性能:预加载全站 UI 字体(Styrene A 标题 + Anthropic Sans 正文),
            serif/mono 按需使用不预载 */}
        <link rel="preload" href="/fonts/styrene-a-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/anthropic-sans-roman.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* favicon:手动引用 public/ 文件,避免 Next 约定注入带 hash query 的 URL
            (Cloudflare Pages 对带 query 的静态文件请求返回 404) */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9f5" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#191919" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {umamiEnabled && (
          <script
            defer
            src={site.umami.scriptSrc}
            data-website-id={site.umami.websiteId}
          />
        )}
      </head>
      <body className="flex min-h-screen flex-col">
        <div aria-hidden="true" className="bg-fx" />
        <EffectLayer />
        <SiteHeader />
        <main className="w-full grow px-5 sm:px-8 md:px-12 xl:px-16">{children}</main>
        {/* 返回按钮放在 body 层:避免被页面模板的入场动画 transform 影响
            (fixed 元素的祖先一旦有 transform,定位基准会从视口变成该祖先) */}
        <BackButton />
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
