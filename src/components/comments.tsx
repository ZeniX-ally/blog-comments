"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

/**
 * Giscus 评论区(https://giscus.app)。
 * - 配置来自 site.giscus;repo 未配置时整节不渲染。
 * - 主题跟随 <html>.dark:light / dark_dimmed;用 MutationObserver 监听 class 变化,
 *   通过 postMessage({ giscus: { setConfig: { theme } } }) 通知 iframe 切换。
 */
export function Comments({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { repo, repoId, category, categoryId, lang } = site.giscus;
  const enabled = Boolean(repo && repoId && categoryId);

  useEffect(() => {
    const host = ref.current;
    if (!enabled || !host) return;

    const getTheme = () => (document.documentElement.classList.contains("dark") ? "dark_dimmed" : "light");

    // 脚本只注入一次(StrictMode 下 effect 会跑两遍);观察器每次都重新挂,cleanup 时拆
    if (!host.dataset.loaded) {
      host.dataset.loaded = "1";
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.setAttribute("data-repo", repo);
      script.setAttribute("data-repo-id", repoId);
      script.setAttribute("data-category", category);
      script.setAttribute("data-category-id", categoryId);
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", "top");
      script.setAttribute("data-theme", getTheme());
      script.setAttribute("data-lang", lang || "zh-CN");
      script.setAttribute("crossorigin", "anonymous");
      host.appendChild(script);
    }

    const applyTheme = () => {
      const frame = host.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: getTheme() } } }, "https://giscus.app");
    };
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [enabled, repo, repoId, category, categoryId, lang]);

  if (!enabled) return null;

  return (
    <section className="comments">
      <div className="label">{label}</div>
      <div ref={ref} />
    </section>
  );
}
