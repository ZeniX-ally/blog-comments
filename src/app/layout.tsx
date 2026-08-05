import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}var m=document.querySelector('meta[name="theme-color"]');if(m){var dark=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);m.setAttribute('content',dark?'#191919':'#ffffff');}}catch(e){}})();`;

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9f5" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#191919" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <div aria-hidden="true" className="bg-fx" />
        <SiteHeader />
        <main className="w-full grow px-5 sm:px-8 md:px-12 xl:px-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
