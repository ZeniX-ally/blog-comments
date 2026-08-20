"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

/**
 * Giscus 评论区(https://giscus.app)。
 * 依赖 src/lib/site.ts 的 site.giscus 配置;repo 为空时渲染提示不加载脚本。
 */
export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { repo, repoId, category, categoryId, lang } = site.giscus;
  const enabled = Boolean(repo && repoId && categoryId);

  useEffect(() => {
    if (!enabled || !ref.current || ref.current.dataset.loaded) return;
    ref.current.dataset.loaded = "1";

    // 依据 html.dark 判断 giscus 主题
    const getTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

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
    ref.current.appendChild(script);

    const applyTheme = () => {
      const frame = ref.current?.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      frame?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: getTheme() } } },
        "https://giscus.app"
      );
    };
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => mo.disconnect();
  }, [enabled, repo, repoId, category, categoryId, lang]);

  if (!enabled) {
    return (
      <section className="mt-16 border-t border-line pt-8">
        <p className="text-xs uppercase tracking-widest text-faint">Comments</p>
        <p className="mt-3 text-sm text-muted">
          评论区未启用 —— 在 src/lib/site.ts 中填写 site.giscus 配置后即开启。
        </p>
      </section>
    );
  }

  return (
    <section className="mt-16 border-t border-line pt-8">
      <p className="text-xs uppercase tracking-widest text-faint">Comments</p>
      <div ref={ref} className="mt-4" />
    </section>
  );
}
