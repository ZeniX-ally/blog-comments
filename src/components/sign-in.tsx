"use client";

import { useEffect, useState } from "react";

type User = { id: number; login: string; name: string; avatar: string };

const GITHUB_ICON = (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

/**
 * 主页 GitHub 登录区。
 * 未登录 → 次级胶囊按钮(跳 /api/auth/github)
 * 已登录 → 头像 + 用户名 + 退出
 * 登录态由 CF Pages Functions(/api/auth/me)提供,静态预览时 404 → 按未登录处理。
 */
export function SignIn() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="font-mono text-xs text-faint">auth…</div>;
  }

  if (!user) {
    return (
      <a
        href="/api/auth/github"
        className="btn-pill btn-ghost btn-pill-sm font-mono text-xs"
      >
        <span>{GITHUB_ICON}</span>
        sign in with GitHub
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={user.avatar}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 rounded-full border border-line object-cover"
      />
      <span className="font-mono text-xs text-muted">{user.name}</span>
      <a
        href="/api/auth/logout"
        className="font-mono text-xs text-faint transition-colors hover:text-accent"
      >
        [logout]
      </a>
    </div>
  );
}
