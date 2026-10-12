/**
 * 归因的浏览器侧存储：first touch 保留 30 天。
 * 来源解析（deriveAttribution）在 lib/apply.ts；这里只管读写 localStorage。
 * 唯一的 import 是类型，编译后会被完全擦除，所以 node:test 能直接加载本文件。
 */
import type { Attribution } from "./apply";

const KEY = "gongyi.attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Stored = Attribution & { ts: number };

/** 读回未过期的首次归因；没有或已过期返回 null */
export function readAttribution(now: number = Date.now()): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (typeof parsed?.ts !== "number") return null;
    if (now - parsed.ts > TTL_MS) return null;
    return { source: String(parsed.source ?? ""), ref: String(parsed.ref ?? "") };
  } catch {
    return null;
  }
}

/**
 * first touch：已有记录就用它；本次既无来源也无 referrer 时不写入，
 * 返回 spec 的 direct 标记（空记录不能占掉后续真实归因）。
 */
export function rememberAttribution(
  derived: Attribution,
  now: number = Date.now(),
): Attribution {
  const stored = readAttribution(now);
  if (stored) return stored;
  if (!derived.source && !derived.ref) {
    return { source: "direct", ref: "" };
  }
  try {
    localStorage.setItem(KEY, JSON.stringify({ source: derived.source, ref: derived.ref, ts: now }));
  } catch {
    /* 隐私模式等写入失败：本次仍按 derived 用 */
  }
  return derived;
}

/** 已记住的来源；没有则返回空串（埋点用，不写入） */
export function currentAttribution(now: number = Date.now()): Attribution {
  return readAttribution(now) ?? { source: "", ref: "" };
}
