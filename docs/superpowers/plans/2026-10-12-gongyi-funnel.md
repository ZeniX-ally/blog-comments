# 公益站导流位与邀请码申请入口 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建一个可对外分享的落地页 `/gongyi/`（中英双语），访客留下邮箱申请邀请码，你收到 Telegram 推送后人工发码，每次申请都带来源渠道。

**Architecture:** 页面仍是 Next 静态导出（`output: "export"`），服务端只有一个 Cloudflare Pages Function（`functions/api/gongyi/apply.ts`），由 `out/_routes.json` 限定在 `/api/*` 触发，静态请求不经过 Function。所有规则性逻辑放在无依赖的 `src/lib/apply.ts`，客户端、Worker、node:test 三方共用同一份实现。KV 只存限流计数与邮箱哈希，Telegram 是唯一的发放闸门。

**Tech Stack:** Next 16（App Router、静态导出）+ React 19 + TypeScript 5.9 + Node 24 + Cloudflare Pages Functions + Workers KV + Umami 事件 + Telegram Bot API。不新增任何依赖。

**Spec:** `docs/superpowers/specs/2026-10-12-gongyi-funnel-design.md`

## Global Constraints

- **`wb.404-found.uk` 绝不出现在 `/gongyi/` 页面或 `content/gongyi*.md` 里**（两者都有自动测试守着）。公益站地址只出现在你发出的邮件中。
- `next.config.ts` 的 `output: "export"` 与 `trailingSlash: true` 不动；Function 只允许挂在 `/api/*`。
- `dict.zh` 与 `dict.en` 的键集合必须完全一致（`tests/i18n.test.mjs` 强制）。
- 精确常量：`EMAIL_MAX=254`、`SOURCE_MAX=64`、`MIN_ELAPSED_MS=3000`、`RATE_LIMIT=3`、`RATE_WINDOW_SEC=3600`、`DEDUPE_WINDOW_SEC=86400`、`BODY_MAX=1024`。
- 不引新依赖；不装 `@cloudflare/workers-types`（`functions/` 不在 tsconfig 的 include 内，Function 文件自带最小类型声明）。
- 服务端不落邮箱明文，去重只存 `sha256(email)`。
- 路由固定为 `/gongyi/` 与 `/en/gongyi/`；样式一律复用现有 class 与 token，只允许追加 `.apply-form*` 一小块。
- `src/lib/apply.ts`、`src/lib/attribution.ts`、`src/lib/markdown-sections.ts`、`src/lib/gongyi-sections.ts` **必须零运行时 import**（只能用 `import type`），否则 `node --experimental-strip-types` 的测试加载不了。Next 侧用 `moduleResolution: "bundler"`，应用代码里带 `.ts` 后缀的 import 是非法的，别用。
- 注释与文案用中文，与仓库既有风格一致。
- 每个任务结束都必须 `npx tsc --noEmit` 与 `npm test` 绿。

---

### Task 1: 申请纯逻辑 `src/lib/apply.ts`

**Files:**
- Create: `src/lib/apply.ts`
- Test: `tests/apply.test.mjs`

**Interfaces:**
- Consumes: 无（该文件零依赖）
- Produces: `APPLY_PATH`、`EVENT_CTA`、`EVENT_SUBMIT`、`EVENT_SUCCESS`、`EVENT_ERROR`、`EMAIL_MAX`、`SOURCE_MAX`、`MIN_ELAPSED_MS`、`RATE_LIMIT`、`RATE_WINDOW_SEC`、`DEDUPE_WINDOW_SEC`、`BODY_MAX`、类型 `Attribution { source: string; ref: string }`、类型 `ApplyPayload { email; source; ref; hp; elapsed: number | null }`、类型 `ParseResult`、函数 `isValidEmail(raw: unknown): boolean`、`normalizeEmail(raw: string): string`、`normalizeSource(raw: unknown): string`、`normalizeRef(raw: unknown): string`、`isSelfHost(host: string, selfHost: string): boolean`、`deriveAttribution({ search, referrer, selfHost }): Attribution`、`isSpam({ hp, elapsed }): boolean`、`isRateLimited(count: number, limit?: number): boolean`、`parseApplyPayload(body: string): ParseResult`、`sha256Hex(value: string): Promise<string>`、`telegramText({ email, source?, ref?, country?, now? }): string`、`isAllowedOrigin(origin: string | null, allowed: string[]): boolean`

- [ ] **Step 1: 写失败的测试**

创建 `tests/apply.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  BODY_MAX,
  EMAIL_MAX,
  RATE_LIMIT,
  SOURCE_MAX,
  deriveAttribution,
  isAllowedOrigin,
  isRateLimited,
  isSpam,
  isValidEmail,
  normalizeEmail,
  normalizeRef,
  normalizeSource,
  parseApplyPayload,
  sha256Hex,
  telegramText,
} from "../src/lib/apply.ts";

test("isValidEmail 接受常见合法邮箱", () => {
  for (const value of ["a@b.co", "zenix.ally+tag@mail.example.com", "  a@b.co  "]) {
    assert.equal(isValidEmail(value), true, value);
  }
});

test("isValidEmail 拒绝缺 @ / 双 @ / 空白 / 换行 / 无点域名 / 超长 / 非字符串", () => {
  for (const value of ["ab.co", "a@@b.co", "a b@c.co", "a@b\n.co", "a@localhost", "", "   "]) {
    assert.equal(isValidEmail(value), false, JSON.stringify(value));
  }
  assert.equal(isValidEmail(`${"a".repeat(EMAIL_MAX)}@b.co`), false);
  assert.equal(isValidEmail(123), false);
  assert.equal(isValidEmail(null), false);
});

test("normalizeEmail 去空白并小写", () => {
  assert.equal(normalizeEmail("  Zenix@Mail.Example.com "), "zenix@mail.example.com");
});

test("normalizeSource 只留白名单字符并截断", () => {
  assert.equal(normalizeSource("V2EX"), "v2ex");
  assert.equal(normalizeSource("v2ex:launch"), "v2ex:launch");
  assert.equal(normalizeSource("<script>alert(1)</script>"), "scriptalert1script");
  assert.equal(normalizeSource("a".repeat(100)).length, SOURCE_MAX);
  assert.equal(normalizeSource(null), "");
});

test("normalizeRef 取 host 并过滤", () => {
  assert.equal(normalizeRef("https://tieba.baidu.com/p/123"), "tieba.baidu.com");
  assert.equal(normalizeRef("V2EX.com"), "v2ex.com");
  assert.equal(normalizeRef(""), "");
  assert.equal(normalizeRef(undefined), "");
});

test("deriveAttribution：UTM 优先，带 campaign 拼成 source:campaign", () => {
  assert.deepEqual(
    deriveAttribution({
      search: "?utm_source=v2ex&utm_campaign=launch",
      referrer: "https://tieba.baidu.com/p/1",
      selfHost: "404-found.uk",
    }),
    { source: "v2ex:launch", ref: "tieba.baidu.com" },
  );
});

test("deriveAttribution：只有 utm_source 时不拼 campaign", () => {
  assert.equal(
    deriveAttribution({ search: "?utm_source=hg", referrer: "", selfHost: "404-found.uk" }).source,
    "hg",
  );
});

test("deriveAttribution：无 UTM 时退回 referrer，同域与子域视为没有", () => {
  assert.deepEqual(
    deriveAttribution({ search: "", referrer: "https://tieba.baidu.com/p/1", selfHost: "404-found.uk" }),
    { source: "", ref: "tieba.baidu.com" },
  );
  assert.deepEqual(
    deriveAttribution({ search: "", referrer: "https://404-found.uk/gongyi/", selfHost: "404-found.uk" }),
    { source: "", ref: "" },
  );
  assert.deepEqual(
    deriveAttribution({ search: "", referrer: "https://blog.404-found.uk/x", selfHost: "404-found.uk" }),
    { source: "", ref: "" },
  );
  assert.deepEqual(
    deriveAttribution({ search: "?utm_source=x", referrer: "", selfHost: "" }),
    { source: "x", ref: "" },
  );
});

test("isSpam：蜜罐有值或停留过短判为脚本", () => {
  assert.equal(isSpam({ hp: "x", elapsed: 9999 }), true);
  assert.equal(isSpam({ hp: "", elapsed: 1000 }), true);
  assert.equal(isSpam({ hp: "", elapsed: 3000 }), false);
  assert.equal(isSpam({ hp: "", elapsed: null }), false);
  assert.equal(isSpam({ hp: undefined, elapsed: -1 }), false);
  assert.equal(isSpam({ hp: "  ", elapsed: 5000 }), false);
});

test("isRateLimited：达到上限即拦住", () => {
  assert.equal(isRateLimited(0), false);
  assert.equal(isRateLimited(2), false);
  assert.equal(isRateLimited(RATE_LIMIT), true);
  assert.equal(isRateLimited(4, 5), false);
});

test("parseApplyPayload：合法请求被规范化", () => {
  const out = parseApplyPayload(
    JSON.stringify({
      email: " A@B.CO ",
      source: "V2EX:Launch",
      ref: "https://tieba.baidu.com/p/1",
      hp: "",
      elapsed: 8000,
    }),
  );
  assert.equal(out.ok, true);
  assert.deepEqual(out.payload, {
    email: "a@b.co",
    source: "v2ex:launch",
    ref: "tieba.baidu.com",
    hp: "",
    elapsed: 8000,
  });
});

test("parseApplyPayload：缺 hp / elapsed 走安全默认值", () => {
  const out = parseApplyPayload(JSON.stringify({ email: "a@b.co" }));
  assert.equal(out.ok, true);
  assert.equal(out.payload.hp, "");
  assert.equal(out.payload.elapsed, null);
});

test("parseApplyPayload：坏 JSON / 非对象 / 超长 / 邮箱不合法", () => {
  assert.deepEqual(parseApplyPayload("not json"), { ok: false, error: "bad_json" });
  assert.deepEqual(parseApplyPayload(""), { ok: false, error: "bad_json" });
  assert.deepEqual(parseApplyPayload("[]"), { ok: false, error: "bad_json" });
  assert.deepEqual(parseApplyPayload(JSON.stringify({ email: "nope" })), {
    ok: false,
    error: "invalid_email",
  });
  assert.deepEqual(parseApplyPayload(`{"email":"${"a".repeat(BODY_MAX)}@b.co"}`), {
    ok: false,
    error: "body_too_large",
  });
});

test("isAllowedOrigin：生产站与本地放行，其他拒绝", () => {
  const allowed = ["https://404-found.uk", "http://localhost:8788"];
  assert.equal(isAllowedOrigin("https://404-found.uk", allowed), true);
  assert.equal(isAllowedOrigin("https://404-found.uk/", allowed), true);
  assert.equal(isAllowedOrigin("http://localhost:8788", allowed), true);
  assert.equal(isAllowedOrigin("https://evil.example", allowed), false);
  assert.equal(isAllowedOrigin(null, allowed), false);
});

test("sha256Hex 与已知向量一致", async () => {
  assert.equal(
    await sha256Hex("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("telegramText 组装通知内容，缺来源时不输出该行", () => {
  const now = new Date("2026-10-12T14:03:00Z");
  assert.equal(
    telegramText({
      email: "a@b.co",
      source: "v2ex:launch",
      ref: "tieba.baidu.com",
      country: "CN",
      now,
    }),
    [
      "新的邀请码申请",
      "邮箱: a@b.co",
      "来源: v2ex:launch",
      "Referrer: tieba.baidu.com",
      "地区: CN · 2026-10-12 14:03 UTC",
    ].join("\n"),
  );
  const bare = telegramText({ email: "a@b.co", now });
  assert.equal(bare.includes("来源"), false);
  assert.equal(bare.includes("地区: ?? · 2026-10-12 14:03 UTC"), true);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL —— `Cannot find module .../src/lib/apply.ts`

- [ ] **Step 3: 实现 `src/lib/apply.ts`**

```ts
/**
 * 邀请码申请：纯逻辑。
 * 客户端、Pages Function、node:test 三方共用，所以这里不允许任何运行时 import
 * （零 node / Next / JSON 依赖，才能被 Worker 打包、被浏览器打包、被 node --test 直接加载）。
 */

/** 接口路径（客户端与 Function 路由共用同一份字面量） */
export const APPLY_PATH = "/api/gongyi/apply";

/** Umami 事件名 */
export const EVENT_CTA = "gongyi_cta_click";
export const EVENT_SUBMIT = "gongyi_apply_submit";
export const EVENT_SUCCESS = "gongyi_apply_success";
export const EVENT_ERROR = "gongyi_apply_error";

/** 邮箱长度上限（RFC 5321 实践上限） */
export const EMAIL_MAX = 254;
/** 来源 / referrer 串长度上限 */
export const SOURCE_MAX = 64;
/** 表单最短停留；低于此值视为脚本（毫秒） */
export const MIN_ELAPSED_MS = 3000;
/** 同 IP 每小时申请上限 */
export const RATE_LIMIT = 3;
/** 限流窗口（秒），同时是 KV 的 expirationTtl */
export const RATE_WINDOW_SEC = 3600;
/** 同邮箱去重窗口（秒） */
export const DEDUPE_WINDOW_SEC = 86400;
/** 请求体上限（字符数） */
export const BODY_MAX = 1024;

export type Attribution = {
  /** 形如 v2ex 或 v2ex:launch；空串表示直接访问 */
  source: string;
  /** 来源页 host；空串表示同域或没有 referrer */
  ref: string;
};

export type ApplyPayload = {
  email: string;
  source: string;
  ref: string;
  hp: string;
  /** null 表示客户端没给有效值，跳过时序判定 */
  elapsed: number | null;
};

/** 邮箱校验：单 @、两端非空、域名带点、无空白与换行、总长 ≤254 */
export function isValidEmail(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  if (value.length === 0 || value.length > EMAIL_MAX) return false;
  if (/[\s\r\n]/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (!domain.includes(".")) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  return true;
}

/** 去重用的规范化邮箱 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** 来源串：小写 + 白名单 [a-z0-9._:-] + 截断 64 */
export function normalizeSource(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9._:-]/g, "")
    .slice(0, SOURCE_MAX);
}

/** referrer 归一化为 host：接受完整 URL 或裸 host，同样走白名单 */
export function normalizeRef(raw: unknown): string {
  if (typeof raw !== "string") return "";
  let value = raw.trim().toLowerCase();
  if (value.length === 0) return "";
  try {
    value = new URL(value).host;
  } catch {
    /* 不是完整 URL 就按 host 原样处理 */
  }
  return value.replace(/[^a-z0-9.:-]/g, "").slice(0, SOURCE_MAX);
}

/** host 是否属于本站（同域 referrer 不算获客来源） */
export function isSelfHost(host: string, selfHost: string): boolean {
  if (!host || !selfHost) return false;
  return host === selfHost || host.endsWith(`.${selfHost}`);
}

/**
 * 组装本次落地看到的来源（纯函数，不碰存储）。
 * UTM 优先；没有 UTM 时用 referrer host 兜底；同域 referrer 视为没有。
 */
export function deriveAttribution(input: {
  search: string;
  referrer: string;
  selfHost: string;
}): Attribution {
  const params = new URLSearchParams(input.search || "");
  const source = normalizeSource(params.get("utm_source") ?? "");
  const campaign = normalizeSource(params.get("utm_campaign") ?? "");
  const ref = normalizeRef(input.referrer);
  return {
    source: source ? (campaign ? `${source}:${campaign}` : source) : "",
    ref: isSelfHost(ref, input.selfHost) ? "" : ref,
  };
}

/** 蜜罐 / 时序：命中即静默丢弃（对外仍返回成功） */
export function isSpam(input: { hp?: unknown; elapsed?: number | null }): boolean {
  if (typeof input.hp === "string" && input.hp.trim().length > 0) return true;
  const elapsed = input.elapsed;
  if (
    typeof elapsed === "number" &&
    Number.isFinite(elapsed) &&
    elapsed >= 0 &&
    elapsed < MIN_ELAPSED_MS
  ) {
    return true;
  }
  return false;
}

/** 限流判定：count 是「本次之前」的计数 */
export function isRateLimited(count: number, limit: number = RATE_LIMIT): boolean {
  return count >= limit;
}

export type ParseResult =
  | { ok: true; payload: ApplyPayload }
  | { ok: false; error: string };

/** 解析并校验请求体；hp / elapsed 缺失一律降级为安全默认值，不单独报错 */
export function parseApplyPayload(body: string): ParseResult {
  if (body.length > BODY_MAX) return { ok: false, error: "body_too_large" };
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return { ok: false, error: "bad_json" };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "bad_json" };
  }
  const row = data as Record<string, unknown>;
  if (!isValidEmail(row.email)) return { ok: false, error: "invalid_email" };
  const elapsed =
    typeof row.elapsed === "number" && Number.isFinite(row.elapsed) ? row.elapsed : null;
  return {
    ok: true,
    payload: {
      email: normalizeEmail(String(row.email)),
      source: normalizeSource(row.source),
      ref: normalizeRef(row.ref),
      hp: typeof row.hp === "string" ? row.hp : "",
      elapsed,
    },
  };
}

/** 邮箱哈希（去重 key，不落明文） */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Telegram 通知文案（纯文本，不用 parse_mode，避免转义问题） */
export function telegramText(input: {
  email: string;
  source?: string;
  ref?: string;
  country?: string;
  now?: Date;
}): string {
  const lines = ["新的邀请码申请", `邮箱: ${input.email}`];
  if (input.source) lines.push(`来源: ${input.source}`);
  if (input.ref) lines.push(`Referrer: ${input.ref}`);
  const stamp = (input.now ?? new Date()).toISOString().replace("T", " ").slice(0, 16);
  lines.push(`地区: ${input.country || "??"} · ${stamp} UTC`);
  return lines.join("\n");
}

/** Origin 白名单判定（名单由调用方给，Function 侧从 site-core.json 组装） */
export function isAllowedOrigin(origin: string | null, allowed: string[]): boolean {
  if (!origin) return false;
  return allowed.includes(origin.replace(/\/$/, ""));
}
```

- [ ] **Step 4: 跑测试与类型检查**

Run: `npm test` → 全绿（含既有 6 个用例）
Run: `npx tsc --noEmit` → 零错误

- [ ] **Step 5: 提交**

```bash
git add src/lib/apply.ts tests/apply.test.mjs
git commit -m "feat(gongyi): apply 纯逻辑与单测"
```

---

### Task 2: 归因存储、埋点包装与浏览器侧胶水

**Files:**
- Create: `src/lib/attribution.ts`、`src/lib/analytics.ts`、`src/lib/capture.ts`
- Test: `tests/attribution.test.mjs`

**Interfaces:**
- Consumes: `Attribution` 类型（来自 Task 1 的 `src/lib/apply.ts`，只允许 `import type`）、`deriveAttribution`（Task 1）
- Produces: `readAttribution(now?: number): Attribution | null`、`rememberAttribution(derived: Attribution, now?: number): Attribution`、`currentAttribution(now?: number): Attribution`（attribution.ts）；`track(event: string, data?: Record<string, string | number | boolean>): void`（analytics.ts）；`captureAttribution(): Attribution`（capture.ts）

- [ ] **Step 1: 写失败的测试**

创建 `tests/attribution.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  currentAttribution,
  readAttribution,
  rememberAttribution,
} from "../src/lib/attribution.ts";

const KEY = "gongyi.attribution";
const DAY = 24 * 60 * 60 * 1000;

/** 极简 localStorage 替身，node 里没有这个全局对象 */
function stubStorage() {
  const map = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    },
    configurable: true,
    writable: true,
  });
  return map;
}

test("rememberAttribution：首次写入并原样返回", () => {
  stubStorage();
  const now = 1000000;
  assert.deepEqual(rememberAttribution({ source: "v2ex", ref: "tieba.baidu.com" }, now), {
    source: "v2ex",
    ref: "tieba.baidu.com",
  });
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).ts, now);
});

test("rememberAttribution：first touch 不被后续覆盖", () => {
  stubStorage();
  const now = 1000000;
  rememberAttribution({ source: "v2ex", ref: "tieba.baidu.com" }, now);
  assert.deepEqual(rememberAttribution({ source: "other", ref: "example.com" }, now + DAY), {
    source: "v2ex",
    ref: "tieba.baidu.com",
  });
});

test("readAttribution：超过 30 天视为过期", () => {
  stubStorage();
  const now = 1000000;
  rememberAttribution({ source: "v2ex", ref: "" }, now);
  assert.deepEqual(readAttribution(now + 29 * DAY), { source: "v2ex", ref: "" });
  assert.equal(readAttribution(now + 31 * DAY), null);
});

test("readAttribution：缺失与损坏数据都不抛错", () => {
  stubStorage();
  assert.equal(readAttribution(0), null);
  globalThis.localStorage.setItem(KEY, "{不是 json");
  assert.equal(readAttribution(0), null);
  globalThis.localStorage.setItem(KEY, JSON.stringify({ source: "x" }));
  assert.equal(readAttribution(0), null);
});

test("currentAttribution：没有记录时返回空来源", () => {
  stubStorage();
  assert.deepEqual(currentAttribution(0), { source: "", ref: "" });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL —— `Cannot find module .../src/lib/attribution.ts`

- [ ] **Step 3: 实现三个模块**

`src/lib/attribution.ts`（只 `import type`，保持 node 可加载）：

```ts
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

/** first touch：已有记录就用它，否则写入本次并返回本次 */
export function rememberAttribution(
  derived: Attribution,
  now: number = Date.now(),
): Attribution {
  const stored = readAttribution(now);
  if (stored) return stored;
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
```

`src/lib/analytics.ts`：

```ts
/**
 * Umami 事件埋点：脚本没加载、被拦截、或字段不合法时静默跳过，绝不抛错。
 */
type TrackData = Record<string, string | number | boolean>;

type Umami = { track?: (event: string, data?: TrackData) => void };

export function track(event: string, data?: TrackData): void {
  if (typeof window === "undefined") return;
  try {
    (window as unknown as { umami?: Umami }).umami?.track?.(event, data);
  } catch {
    /* 埋点失败不影响主流程 */
  }
}
```

`src/lib/capture.ts`（浏览器侧胶水，合起来给 CTA 与表单用）：

```ts
/**
 * 浏览器侧取「本次落地的来源」：UTM 优先、referrer 兜底、first touch 保留 30 天。
 * 只在客户端调用（引用了 window / document）。
 */
import { deriveAttribution, type Attribution } from "@/lib/apply";
import { rememberAttribution } from "@/lib/attribution";

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return { source: "", ref: "" };
  return rememberAttribution(
    deriveAttribution({
      search: window.location.search,
      referrer: document.referrer,
      selfHost: window.location.host,
    }),
  );
}
```

- [ ] **Step 4: 跑测试与类型检查**

Run: `npm test` → 全绿
Run: `npx tsc --noEmit` → 零错误

- [ ] **Step 5: 提交**

```bash
git add src/lib/attribution.ts src/lib/analytics.ts src/lib/capture.ts tests/attribution.test.mjs
git commit -m "feat(gongyi): 归因存储与埋点包装"
```

---

### Task 3: 抽出共用的 Markdown 分节函数

`src/lib/about.ts` 里的 `splitMarkdownSections` 要原样复用到公益页，先抽成共用模块（纯搬运，不改逻辑）。

**Files:**
- Create: `src/lib/markdown-sections.ts`
- Modify: `src/lib/about.ts`（删掉本地函数，改成 import）
- Test: `tests/markdown-sections.test.mjs`

**Interfaces:**
- Consumes: 无
- Produces: `splitMarkdownSections(markdown: string): Map<string, string>`

- [ ] **Step 1: 写失败的测试**

创建 `tests/markdown-sections.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import { splitMarkdownSections } from "../src/lib/markdown-sections.ts";

test("按 ## 切分，忽略首个 ## 之前的内容", () => {
  const map = splitMarkdownSections("前言不该出现\n\n## 一\n\n内容一\n\n## 二\n\n内容二\n");
  assert.deepEqual([...map.keys()], ["一", "二"]);
  assert.equal(map.get("一"), "内容一");
  assert.equal(map.get("二"), "内容二");
});

test("### 不算分节，空节返回空串", () => {
  const map = splitMarkdownSections("## 一\n\n### 子标题\n\n正文\n\n## 二\n");
  assert.equal(map.get("一"), "### 子标题\n\n正文");
  assert.equal(map.get("二"), "");
});

test("没有二级标题时返回空 Map", () => {
  assert.equal(splitMarkdownSections("# 只有一级\n\n正文").size, 0);
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL —— `Cannot find module .../src/lib/markdown-sections.ts`

- [ ] **Step 3: 实现并把 `about.ts` 改为引用**

创建 `src/lib/markdown-sections.ts`：

```ts
/**
 * 把 Markdown 正文按 `## ` 二级标题切成若干节。
 * 关于页与公益页共用；只认二级标题（`###` 属于上一节的内容）。
 */
export function splitMarkdownSections(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let current: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (current) map.set(current, buf.join("\n").trim());
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return map;
}
```

修改 `src/lib/about.ts`：删除本地 `function splitMarkdownSections(...) {...}` 整段，在文件顶部 import 区加一行

```ts
import { splitMarkdownSections } from "./markdown-sections";
```

其余不动（`getAboutContent` 仍在原地，`renderMarkdown` 的 import 也不动）。

- [ ] **Step 4: 跑测试与构建确认搬运没破坏关于页**

Run: `npm test` → 全绿
Run: `npx tsc --noEmit` → 零错误
Run: `npm run build` → 成功，且 `out/about/index.html` 与 `out/en/about/index.html` 存在
Run: `rg -c "splitMarkdownSections" src/lib/about.ts` → `1`（只剩 import 那一处，本地定义已删）

- [ ] **Step 5: 提交**

```bash
git add src/lib/markdown-sections.ts src/lib/about.ts tests/markdown-sections.test.mjs
git commit -m "refactor(lib): 抽出 splitMarkdownSections 供关于页与公益页共用"
```

---

### Task 4: 文案契约、页面文案与内容加载器

**Files:**
- Create: `src/lib/gongyi-sections.ts`、`src/lib/gongyi-content.ts`、`content/gongyi.md`、`content/en/gongyi.md`、`tests/gongyi-content.test.mjs`
- Modify: `src/lib/i18n.ts`（`nav` 各加一项 + 新增 `gongyi` 文案块）

**Interfaces:**
- Consumes: `splitMarkdownSections`（Task 3）、`renderMarkdown`（既有 `src/lib/posts.ts`）
- Produces: `GongyiSectionId`、`GONGYI_SECTION_ORDER`、`GONGYI_SECTION_HEADINGS`（gongyi-sections.ts）；类型 `GongyiContent { title; subtitle; description; sectionsHtml }` 与 `getGongyiContent(lang?: Lang): Promise<GongyiContent>`（gongyi-content.ts）；`dict.zh.gongyi` / `dict.en.gongyi`

- [ ] **Step 1: 写失败的测试**

创建 `tests/gongyi-content.test.mjs`：

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { splitMarkdownSections } from "../src/lib/markdown-sections.ts";
import {
  GONGYI_SECTION_HEADINGS,
  GONGYI_SECTION_ORDER,
} from "../src/lib/gongyi-sections.ts";

const FILES = { zh: "content/gongyi.md", en: "content/en/gongyi.md" };

test("文案里绝不出现公益站域名（硬约束：微信可见范围不露该地址）", () => {
  for (const file of Object.values(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    assert.equal(/wb\.404-found\.uk/.test(raw), false, file);
  }
});

test("两份文案的二级标题与顺序都与分节契约一致", () => {
  for (const [lang, file] of Object.entries(FILES)) {
    const raw = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const headings = [...splitMarkdownSections(raw).keys()];
    const expected = GONGYI_SECTION_ORDER.map((id) => GONGYI_SECTION_HEADINGS[lang][id]);
    assert.deepEqual(headings, expected, file);
  }
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL —— `Cannot find module .../src/lib/gongyi-sections.ts`

- [ ] **Step 3: 实现分节契约与内容加载器**

创建 `src/lib/gongyi-sections.ts`：

```ts
/**
 * 公益页的分节契约：markdown 的 `##` 标题与界面标签的对应关系。
 * 单独放一个零依赖模块，node:test 才能加载它，去校验两份文案的标题与顺序。
 */
import type { Lang } from "./i18n";

export type GongyiSectionId = "what" | "gain" | "how" | "rules";

/** 顺序即页面渲染顺序 */
export const GONGYI_SECTION_ORDER: GongyiSectionId[] = ["what", "gain", "how", "rules"];

/** 各语言下，一个分节 id 对应 markdown 里 `## ` 标题的原文 */
export const GONGYI_SECTION_HEADINGS: Record<Lang, Record<GongyiSectionId, string>> = {
  zh: { what: "这是什么", gain: "能拿到什么", how: "怎么用", rules: "边界与规则" },
  en: { what: "What this is", gain: "What you get", how: "How it works", rules: "Rules" },
};
```

创建 `src/lib/gongyi-content.ts`：

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "@/lib/posts";
import { splitMarkdownSections } from "./markdown-sections";
import type { Lang } from "@/lib/i18n";

export type GongyiContent = {
  title: string;
  subtitle: string;
  description: string;
  /** 按二级标题切分后的 HTML，key 为标题原文 */
  sectionsHtml: Record<string, string>;
};

/** 中文在 content/gongyi.md，英文在 content/en/gongyi.md（与 about 的目录约定一致） */
const contentPaths: Record<Lang, string> = {
  zh: path.join(process.cwd(), "content", "gongyi.md"),
  en: path.join(process.cwd(), "content", "en", "gongyi.md"),
};

/** 从 content/gongyi.md 加载公益页文案（gray-matter + 按 ## 分节渲染） */
export async function getGongyiContent(lang: Lang = "zh"): Promise<GongyiContent> {
  const file = contentPaths[lang];
  const raw = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : ["---", "title: Gongyi", "---", ""].join("\n");

  const { data, content } = matter(raw);
  const sectionsHtml: Record<string, string> = {};
  for (const [heading, body] of splitMarkdownSections(content)) {
    sectionsHtml[heading] = body ? await renderMarkdown(body) : "";
  }

  return {
    title: data.title ? String(data.title) : "Gongyi",
    subtitle: data.subtitle ? String(data.subtitle) : "",
    description: data.description ? String(data.description) : "",
    sectionsHtml,
  };
}
```

- [ ] **Step 4: 写两份文案**

创建 `content/gongyi.md`：

```markdown
---
title: 公益接口
subtitle: 我把自己在跑的 AI 接口分享出来，邀请制，不收钱。
description: 邀请制公益 AI 接口：是什么、怎么用、边界在哪，以及怎么申请邀请码。
---

## 这是什么

我在自己的机器上跑着几套 AI 接口，用不完的算力不想浪费，就拿出来做公益分享。

不收钱、不投放广告、不记录你的调用内容，也不承诺 SLA——它是一个人情，不是一项服务。它同时是邀请制的：入口收窄，才能让真正需要的人用得上。

## 能拿到什么

**具体额度、可用模型与等级规则，拿到邀请码登录后可见。**

大致的形状是：每天签到攒积分，积分换调用额度，等级越高可用模型越多。额度按账户算，不按密钥算。

## 怎么用

1. 在下面留一个能正常收信的邮箱。
2. 我人工确认后，把邀请码发到这个邮箱。
3. 用邀请码注册并登录。
4. 登录后自助创建密钥，接进你自己的工具里。

## 边界与规则

- 仅限个人学习与研究使用，**禁止转售、代购、批量分发密钥**。
- 密钥就是你的身份，不要共享；系统会检测异常调用并自动停用。
- 免费服务不承诺可用性与速度，随时可能调整或停止，请勿用于关键业务。
- 不收费，因此也不提供发票、合同与商业支持。
- 提交申请即表示你接受以上边界。
```

创建 `content/en/gongyi.md`：

```markdown
---
title: Free API
subtitle: I share the AI API endpoints I run myself. Invite-only, no charge.
description: An invite-only free AI API: what it is, how to use it, where its limits are, and how to request an invite.
---

## What this is

I run a few AI API endpoints on my own machines. Rather than let the spare capacity sit idle, I share it.

No fees, no ads, no logging of what you send, and no SLA — it's a favour, not a product. It is invite-only on purpose: keeping the door narrow is what keeps it usable for the people who need it.

## What you get

**Credits, available models, and the level rules become visible after you sign in with an invite code.**

The shape of it: check in daily to collect points, spend points as API credits, and unlock more models as your level grows. Credits belong to the account, not to individual keys.

## How it works

1. Leave an email address that can receive mail.
2. I review it by hand and send an invite code to that address.
3. Register and sign in with the invite code.
4. Create your own API keys and plug them into your tools.

## Rules

- Personal study and research only. **Reselling, bulk-buying, or redistributing keys is not allowed.**
- Your key is your identity — don't share it. Anomalous traffic is detected and keys are disabled automatically.
- A free service promises nothing about uptime or speed. It may change or stop at any time, so don't build anything critical on it.
- Since it's free, there is no invoicing, no contract, and no commercial support.
- Requesting an invite means you accept these terms.
```

- [ ] **Step 5: 扩字典**

修改 `src/lib/i18n.ts`：`dict.zh.nav` 数组末尾追加一项，`dict.zh` 里新增 `gongyi` 块。

zh 的 `nav` 变成：

```ts
    nav: [
      { href: "/projects", label: "作品" },
      { href: "/about", label: "关于" },
      { href: "/blog", label: "文章" },
      { href: "/tools", label: "工具" },
      { href: "/gongyi", label: "公益接口" },
    ],
```

zh 的 `gongyi` 块（放在 `about` 之后）：

```ts
    gongyi: {
      label: "Gongyi",
      cta: "申请邀请码",
      what: "这是什么",
      gain: "能拿到什么",
      how: "怎么用",
      rules: "边界与规则",
      form: {
        label: "申请邀请码",
        emailLabel: "邮箱",
        placeholder: "you@example.com",
        submit: "申请邀请码",
        submitting: "提交中…",
        success: "已收到，我会尽快把邀请码发到这个邮箱，注意查收垃圾邮件。",
        invalidEmail: "请填一个能收信的邮箱。",
        rateLimited: "提交太频繁了，请稍后再试。",
        failed: "提交失败，请稍后重试。",
        privacy: "邮箱只用于发送邀请码，可随时要求我删除。",
      },
    },
```

en 的 `nav` 数组末尾追加：

```ts
      { href: "/en/gongyi", label: "Free API" },
```

en 的 `gongyi` 块：

```ts
    gongyi: {
      label: "Gongyi",
      cta: "Request an invite",
      what: "What this is",
      gain: "What you get",
      how: "How it works",
      rules: "Rules",
      form: {
        label: "Request an invite",
        emailLabel: "Email",
        placeholder: "you@example.com",
        submit: "Request an invite",
        submitting: "Sending…",
        success: "Got it. I'll email the invite code to this address — check your spam folder too.",
        invalidEmail: "Please enter an address that can receive mail.",
        rateLimited: "Too many requests. Please try again later.",
        failed: "Submission failed. Please try again later.",
        privacy: "The address is only used to send the invite code; I'll delete it on request.",
      },
    },
```

- [ ] **Step 6: 跑测试与类型检查**

Run: `npm test` → 全绿（新增 2 个用例 + `tests/i18n.test.mjs` 的键对齐必须过）
Run: `npx tsc --noEmit` → 零错误

- [ ] **Step 7: 提交**

```bash
git add src/lib/i18n.ts src/lib/gongyi-sections.ts src/lib/gongyi-content.ts content/gongyi.md content/en/gongyi.md tests/gongyi-content.test.mjs
git commit -m "feat(gongyi): 页面文案、分节契约与内容加载器"
```

---

### Task 5: 页面、视图与页头 CTA

**Files:**
- Create: `src/views/gongyi.tsx`、`src/components/gongyi-cta.tsx`、`src/app/gongyi/page.tsx`、`src/app/en/gongyi/page.tsx`

**Interfaces:**
- Consumes: `GongyiContent`、`getGongyiContent`（Task 4）、`GONGYI_SECTION_ORDER`、`GONGYI_SECTION_HEADINGS`（Task 4）、`dict[lang].gongyi`（Task 4）、`captureAttribution`（Task 2）、`track`/`EVENT_CTA`（Task 2/1）、`pageMeta`（既有）
- Produces: 页面路由 `/gongyi/` 与 `/en/gongyi/`；组件 `<GongyiView lang content />`、`<GongyiCta href label />`

- [ ] **Step 1: 写页头 CTA 组件**

创建 `src/components/gongyi-cta.tsx`：

```tsx
"use client";

import { EVENT_CTA } from "@/lib/apply";
import { track } from "@/lib/analytics";
import { captureAttribution } from "@/lib/capture";

/**
 * 页头的「申请邀请码」锚点按钮。
 * 它是普通 <a href="#apply">，没有 JS 也能滚到表单；埋点只是附加行为。
 */
export function GongyiCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="pill"
      href={href}
      onClick={() => {
        const attribution = captureAttribution();
        track(EVENT_CTA, { source: attribution.source });
      }}
    >
      {label} <span className="arrow">→</span>
    </a>
  );
}
```

- [ ] **Step 2: 写视图**

创建 `src/views/gongyi.tsx`：

```tsx
import { Stagger } from "@/components/stagger";
import { ApplyForm } from "@/components/apply-form";
import { GongyiCta } from "@/components/gongyi-cta";
import { dict, type Lang } from "@/lib/i18n";
import { GONGYI_SECTION_HEADINGS, GONGYI_SECTION_ORDER } from "@/lib/gongyi-sections";
import type { GongyiContent } from "@/lib/gongyi-content";

type GongyiViewProps = {
  lang: Lang;
  content: GongyiContent;
};

/**
 * 公益页：页头（label + h1 + 导语 + 申请锚点按钮）→ 四个分节（markdown 渲染）
 * → 申请表单 → 隐私说明。分节的标题原文由 GONGYI_SECTION_HEADINGS 给出，
 * 界面标签取自 dict.gongyi，两者分开，改界面文案不会让某一节消失。
 */
export function GongyiView({ lang, content }: GongyiViewProps) {
  const d = dict[lang].gongyi;
  const headings = GONGYI_SECTION_HEADINGS[lang];
  const labels = { what: d.what, gain: d.gain, how: d.how, rules: d.rules };

  return (
    <div className="content">
      <header className="page-head">
        <Stagger>
          <div className="label reveal">{d.label}</div>
          <h1 className="reveal">{content.title}</h1>
          {content.subtitle && <p className="lede reveal">{content.subtitle}</p>}
          <div className="pill-row reveal">
            <GongyiCta href="#apply" label={d.cta} />
          </div>
        </Stagger>
      </header>

      <div className="page-body">
        {GONGYI_SECTION_ORDER.map((id) => {
          const html = content.sectionsHtml[headings[id]] ?? "";
          if (!html) return null;
          return (
            <section key={id} className="about-section rise">
              <div className="label">{labels[id]}</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
            </section>
          );
        })}

        <section id="apply" className="about-section rise">
          <div className="label">{d.form.label}</div>
          <ApplyForm lang={lang} />
        </section>

        <p className="label rise">{d.form.privacy}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 写两个页面壳**

创建 `src/app/gongyi/page.tsx`：

```tsx
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getGongyiContent } from "@/lib/gongyi-content";
import { PageTransition } from "@/components/page-transition";
import { GongyiView } from "@/views/gongyi";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getGongyiContent("zh");
  return pageMeta({
    title: content.title,
    description: content.description,
    path: "/gongyi",
  });
}

export default async function GongyiPage() {
  const content = await getGongyiContent("zh");
  return (
    <PageTransition>
      <GongyiView lang="zh" content={content} />
    </PageTransition>
  );
}
```

创建 `src/app/en/gongyi/page.tsx`（英文页按仓库现有约定不接 `pageMeta`，与 `src/app/en/about/page.tsx` 保持一致）：

```tsx
import type { Metadata } from "next";
import { getGongyiContent } from "@/lib/gongyi-content";
import { PageTransition } from "@/components/page-transition";
import { GongyiView } from "@/views/gongyi";

export const metadata: Metadata = {
  title: "Free API",
  description: "Invite-only free AI API: how it works and how to request an invite.",
};

export default async function GongyiPageEn() {
  const content = await getGongyiContent("en");
  return (
    <PageTransition>
      <GongyiView lang="en" content={content} />
    </PageTransition>
  );
}
```

**注意：** 本步骤引用了 `ApplyForm`，它在 Task 6 才创建。为了让本步骤自身可通过（构建、类型检查），先创建占位实现 `src/components/apply-form.tsx`：

```tsx
"use client";

import { dict, type Lang } from "@/lib/i18n";

/** 占位：Task 6 替换为真实表单 */
export function ApplyForm({ lang }: { lang: Lang }) {
  return <p className="label">{dict[lang].gongyi.form.label}</p>;
}
```

- [ ] **Step 4: 构建并核对产物**

Run: `npm run build`
Expected: 成功，且 `out/gongyi/index.html`、`out/en/gongyi/index.html` 存在

Run: `rg -c "禁止转售" out/gongyi/index.html` → 有匹配（说明分节标题对得上，`边界与规则` 那一节渲染出来了）
Run: `rg -c "visible after you sign in" out/en/gongyi/index.html` → 有匹配
Run: `rg -c "公益接口" out/index.html out/blog/index.html` → 有匹配（导航项出现在每一页）

- [ ] **Step 5: 公益页隐藏顶栏站外入口**

顶栏的「代码仓库」与「控制台」指向 `git.404-found.uk` 与 `wb.404-found.uk`，站内每一页都有。`/gongyi/` 是会被分享进微信的那一页，页头不能出现公益站域名。

修改 `src/components/site-header.tsx`，在 `const HOST = ...` 下面加一行正则：

```ts
/** 公益页会被分享进微信：页头不渲染站外入口，避免露出公益站域名 */
const HIDE_APPS = /^\/(en\/)?gongyi\/?$/;
```

把组件里的

```tsx
  const apps = site.apps.map((app) => ({ href: app.href, label: d.header[app.key] }));
```

改成

```tsx
  const apps = HIDE_APPS.test(pathname)
    ? []
    : site.apps.map((app) => ({ href: app.href, label: d.header[app.key] }));
```

`MobileMenu` 收到空数组时本来就不渲染入口，不用改它。

- [ ] **Step 6: 重新构建，核对硬约束**

Run: `npm run build`
Run: `rg -o -c "wb\.404-found\.uk" out/gongyi/index.html` → `0`（硬约束）
Run: `rg -o -c "wb\.404-found\.uk" out/en/gongyi/index.html` → `0`
Run: `rg -o -c "wb\.404-found\.uk" out/tools/index.html` → `1`（其余页面的顶栏入口没被动到）

- [ ] **Step 7: 视觉核对**

Run: `npm run dev`，浏览器打开 `http://localhost:3000/gongyi/`（你本机 dev server 端口以实际输出为准）
Expected：页头 label + 大标题 + 衬线导语 + 黑色 pill 按钮，**且页头右侧没有「代码仓库 / 控制台」两个入口**；四个分节各带 mono 标签；浅/暗主题、`≤760px` 宽度、`ZH / EN` 切换（应停在 `/en/gongyi/`）都正常。随便打开 `/tools/` 确认那两个入口还在。

- [ ] **Step 8: 提交**

```bash
git add src/views/gongyi.tsx src/components/gongyi-cta.tsx src/components/apply-form.tsx src/components/site-header.tsx src/app/gongyi/page.tsx src/app/en/gongyi/page.tsx
git commit -m "feat(gongyi): 落地页、视图与页头 CTA"
```

---

### Task 6: 申请表单与表单样式

**Files:**
- Modify: `src/components/apply-form.tsx`（替换占位实现）
- Modify: `src/styles/components.css`（末尾追加「公益页」样式块）

**Interfaces:**
- Consumes: `APPLY_PATH`、`EVENT_SUBMIT`、`EVENT_SUCCESS`、`EVENT_ERROR`、`isValidEmail`（Task 1）、`captureAttribution`（Task 2）、`track`（Task 2）、`dict[lang].gongyi.form`（Task 4）
- Produces: `<ApplyForm lang />`，POST `application/json` 到 `/api/gongyi/apply`，请求体字段 `{ email, source, ref, hp, elapsed }`

- [ ] **Step 1: 替换占位实现**

`src/components/apply-form.tsx` 全量替换为：

```tsx
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { dict, type Lang } from "@/lib/i18n";
import {
  APPLY_PATH,
  EVENT_ERROR,
  EVENT_SUBMIT,
  EVENT_SUCCESS,
  isValidEmail,
  type Attribution,
} from "@/lib/apply";
import { captureAttribution } from "@/lib/capture";
import { track } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * 邀请码申请表单：邮箱 + 蜜罐字段。
 * 蜜罐是视觉隐藏的输入框，真人看不见、脚本会填，服务端见到有值就静默丢弃。
 * 停留时长（挂载到提交的毫秒数）一并上报，服务端用它拦掉秒提交的脚本。
 */
export function ApplyForm({ lang }: { lang: Lang }) {
  const d = dict[lang].gongyi.form;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const mountedAt = useRef(0);
  const attribution = useRef<Attribution>({ source: "", ref: "" });

  useEffect(() => {
    mountedAt.current = Date.now();
    attribution.current = captureAttribution();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage(d.invalidEmail);
      return;
    }

    setStatus("submitting");
    setMessage("");
    track(EVENT_SUBMIT, { source: attribution.current.source });

    try {
      const res = await fetch(APPLY_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: attribution.current.source,
          ref: attribution.current.ref,
          hp: honeypot.current?.value ?? "",
          elapsed: mountedAt.current ? Date.now() - mountedAt.current : -1,
        }),
      });

      if (res.ok) {
        setStatus("success");
        track(EVENT_SUCCESS, { source: attribution.current.source });
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(res.status === 429 ? d.rateLimited : d.failed);
      track(EVENT_ERROR, {
        source: attribution.current.source,
        reason: String(body.error ?? res.status),
      });
    } catch {
      setStatus("error");
      setMessage(d.failed);
      track(EVENT_ERROR, { source: attribution.current.source, reason: "network" });
    }
  }

  if (status === "success") {
    return (
      <p className="apply-form-status is-success" role="status">
        {d.success}
      </p>
    );
  }

  return (
    <form className="apply-form" onSubmit={onSubmit} noValidate>
      <label className="apply-form-field">
        <span>{d.emailLabel}</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={d.placeholder}
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>

      {/* 蜜罐：真人看不见，脚本会填；有值即被服务端静默丢弃 */}
      <input
        ref={honeypot}
        className="apply-form-honey"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" className="pill" disabled={status === "submitting"}>
        {status === "submitting" ? d.submitting : d.submit}
      </button>

      <p
        className={`apply-form-status${status === "error" ? " is-error" : ""}`}
        role={status === "error" ? "alert" : "status"}
      >
        {message}
      </p>
      <p className="label">{d.privacy}</p>
    </form>
  );
}
```

- [ ] **Step 2: 追加表单样式**

在 `src/styles/components.css` 末尾追加：

```css
/* 公益页：申请表单（复用 token 与 .pill，不新增视觉语言） */
.apply-form { max-width: 520px; }
.apply-form-field { display: block; }
.apply-form-field > span { display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
.apply-form input[type="email"] { width: 100%; background: var(--bg); color: var(--fg); border: 1px solid var(--hair); border-radius: 8px; padding: 10px 12px; font-family: var(--font-serif); font-size: 17px; line-height: 1.4; }
.apply-form input[type="email"]:focus { outline: none; border-color: var(--accent); }
.apply-form button.pill { margin-top: 16px; border: 0; cursor: pointer; font-family: var(--font-serif); }
.apply-form button.pill[disabled] { opacity: 0.55; cursor: default; }
.apply-form-honey { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.apply-form-status { margin-top: 14px; font-family: var(--font-serif); font-size: 16px; line-height: 1.6; color: var(--muted); }
.apply-form-status:empty { display: none; }
.apply-form-status.is-error { color: var(--accent); }
.apply-form-status.is-success { color: var(--fg); }
```

- [ ] **Step 3: 类型检查、测试与构建**

Run: `npx tsc --noEmit` → 零错误
Run: `npm test` → 全绿
Run: `npm run build` → 成功
Run: `rg -c "apply-form-honey" out/gongyi/index.html` → 有匹配（蜜罐进了静态产物）

- [ ] **Step 4: 本地手测客户端行为**

Run: `npm run dev`，打开 `/gongyi/`
Expected：
1. 输入 `abc` 点提交 → 出现红字「请填一个能收信的邮箱。」，不发请求。
2. 输入 `a@b.co` 点提交 → 按钮变「提交中…」并禁用；因为接口还没写，控制台出现 404，状态显示「提交失败，请稍后重试。」。（这是预期，Task 7 接上接口后就正常）
3. 在页头点「申请邀请码」→ 页面滚到表单；`localStorage` 里出现 `gongyi.attribution`。

- [ ] **Step 5: 提交**

```bash
git add src/components/apply-form.tsx src/styles/components.css
git commit -m "feat(gongyi): 申请表单与表单样式"
```

---

### Task 7: 申请接口、路由限定与本地对抗测试

**Files:**
- Create: `functions/api/gongyi/apply.ts`、`scripts/generate-routes.mjs`
- Modify: `package.json`（`build` 链）、`.gitignore`

**Interfaces:**
- Consumes: Task 1 的 `src/lib/apply.ts` 全部导出（Function 用相对路径 import）
- Produces: `POST /api/gongyi/apply`；构建产物 `out/_routes.json`

- [ ] **Step 1: 写 Function**

创建 `functions/api/gongyi/apply.ts`：

```ts
/**
 * 邀请码申请接口。静态站是 output: "export"，这是整个项目唯一的服务端代码。
 * 部署：仓库根 `functions/` 由 `wrangler pages deploy out` 自动带上；
 * `out/_routes.json` 把 Function 限定在 /api/*，静态页面不触发 Function。
 * 本目录被 tsconfig 的 exclude 排除，所以这里自带最小类型声明，不依赖 @cloudflare/workers-types。
 */
import {
  BODY_MAX,
  DEDUPE_WINDOW_SEC,
  RATE_WINDOW_SEC,
  isAllowedOrigin,
  isRateLimited,
  isSpam,
  parseApplyPayload,
  sha256Hex,
  telegramText,
} from "../../../src/lib/apply";
import siteCore from "../../../src/lib/site-core.json";

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  GONGYI_KV?: KVNamespaceLike;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

type Ctx = {
  request: Request & { cf?: { country?: string } };
  env: Env;
};

const SITE_ORIGIN = String(siteCore.url).replace(/\/$/, "");
/** 本地 `wrangler pages dev` 的默认端口也要放行 */
const ALLOWED_ORIGINS = [SITE_ORIGIN, "http://localhost:8788", "http://127.0.0.1:8788"];

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

export async function onRequest(context: Ctx): Promise<Response> {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
  }
  if (!isAllowedOrigin(request.headers.get("Origin"), ALLOWED_ORIGINS)) {
    return json({ ok: false, error: "bad_origin" }, 403);
  }

  const body = await request.text();
  if (body.length > BODY_MAX) return json({ ok: false, error: "body_too_large" }, 400);

  const kv = env.GONGYI_KV;
  const ip = request.headers.get("CF-Connecting-IP") || "Unknown";

  // 限流：先计数再判定，被蜜罐拦下的刷子也要计入次数
  let count = 0;
  if (kv) {
    try {
      const key = `rl:${ip}`;
      count = Number((await kv.get(key)) ?? "0") || 0;
      await kv.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_SEC });
    } catch {
      count = 0; // KV 故障降级放行
    }
  }
  if (isRateLimited(count)) return json({ ok: false, error: "rate_limited" }, 429);

  const parsed = parseApplyPayload(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const { email, source, ref, hp, elapsed } = parsed.payload;

  // 蜜罐 / 时序命中：对外一律成功，不发通知，不给刷子任何反馈
  if (isSpam({ hp, elapsed })) return json({ ok: true }, 200);

  // 去重：命中同样返回成功
  if (kv) {
    try {
      const key = `em:${await sha256Hex(email)}`;
      if (await kv.get(key)) return json({ ok: true }, 200);
      await kv.put(key, "1", { expirationTtl: DEDUPE_WINDOW_SEC });
    } catch {
      /* 降级继续 */
    }
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ ok: false, error: "notify_failed" }, 502);

  const text = telegramText({ email, source, ref, country: request.cf?.country ?? "" });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) return json({ ok: false, error: "notify_failed" }, 502);
  } catch {
    return json({ ok: false, error: "notify_failed" }, 502);
  }

  return json({ ok: true }, 200);
}
```

- [ ] **Step 2: 写路由生成脚本**

创建 `scripts/generate-routes.mjs`：

```js
#!/usr/bin/env node
/**
 * 生成 out/_routes.json：把 Pages Functions 限定在 /api/*。
 * 没有这个文件时，加了 Functions 的项目会让所有静态请求也走 Function，
 * 静态页面的无限免费额度就没了。在 next build 之后运行。
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

if (!fs.existsSync(OUT)) {
  console.error("❌ out/ 不存在，先跑 next build");
  process.exit(1);
}

const routes = { version: 1, include: ["/api/*"], exclude: [] };
fs.writeFileSync(path.join(OUT, "_routes.json"), `${JSON.stringify(routes, null, 2)}\n`);
console.log("✅ _routes.json → include /api/*");
```

- [ ] **Step 3: 接进构建链与忽略清单**

`package.json` 的 `build` 改成（在末尾追加一个 `&&`）：

```json
    "build": "next build && node scripts/generate-feed.mjs && node scripts/generate-og.mjs && node scripts/generate-routes.mjs",
```

`.gitignore` 在 `# env files` 段落的 `.env*` 下面加一行：

```
.dev.vars
```

- [ ] **Step 4: 构建并检查产物**

Run: `npm run build`
Expected: 末尾输出 `✅ _routes.json → include /api/*`

Run: `Get-Content out/_routes.json`
Expected: 含 `"/api/*"`

- [ ] **Step 5: 起本地服务做对抗测试**

先准备凭据：把 `TELEGRAM_BOT_TOKEN` 与 `TELEGRAM_CHAT_ID` 写进项目根 `.dev.vars`（格式 `TELEGRAM_BOT_TOKEN=123:abc`），或直接把它们放进下面的 `-b` 参数。没有凭据时，「正常提交」会得到 502，其余用例照样能跑。

Run（后台起服务）: `npx wrangler pages dev out --kv GONGYI_KV --port 8788`

然后用 curl 逐条验证（PowerShell 里用 `curl.exe`，注意每个都带 `Origin` 头）：

```bash
# 1) 正常提交 → 200，Telegram 收到一条带「来源」的消息
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"a@b.co\",\"source\":\"v2ex:launch\",\"ref\":\"tieba.baidu.com\",\"hp\":\"\",\"elapsed\":5000}"

# 2) 蜜罐命中 → 200 且 Telegram 无新消息
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"bot@b.co\",\"hp\":\"http://spam\",\"elapsed\":5000}"

# 3) 停留过短 → 200 且无通知
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"fast@b.co\",\"hp\":\"\",\"elapsed\":500}"

# 4) 重复邮箱 → 200 且只收到一次通知
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"a@b.co\",\"hp\":\"\",\"elapsed\":5000}"

# 5) 非法邮箱 → 400 invalid_email
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"nope\"}"

# 6) 跨站 Origin → 403
curl.exe -s -o - -w "\n%{http_code}\n" -X POST http://localhost:8788/api/gongyi/apply -H "Origin: https://evil.example" -H "Content-Type: application/json" -d "{\"email\":\"a@b.co\"}"

# 7) GET → 405
curl.exe -s -o - -w "\n%{http_code}\n" http://localhost:8788/api/gongyi/apply

# 8) 连发到超限 → 第 4 次 429（前三次用不同邮箱，避免被去重提前返回）
```

Expected：1) 200 + 通知；2) 200 无通知；3) 200 无通知；4) 200 只有一条通知；5) 400；6) 403；7) 405；8) 第 4 次 429。

Run（另起一次，不绑 KV 验证降级）: `npx wrangler pages dev out --port 8788` 后重复用例 1
Expected: 仍是 200（限流与去重被跳过）

- [ ] **Step 6: 核对静态路径不经过 Function**

`out/_routes.json` 已经保证线上只有 `/api/*` 会触发 Function。本地核对两件事：

Run: `Get-Content out/_routes.json` → 内容为 `{"version": 1, "include": ["/api/*"], "exclude": []}`
Run: 在 `wrangler pages dev` 的终端里请求 `http://localhost:8788/gongyi/`
Expected: 终端不打印任何 Function 相关日志；再请求 `/api/gongyi/apply`（GET 即可）时会打印 405 那次的 Function 日志，说明只有 `/api/*` 走 Function。

线上部署后如需再确认一次，用 `npx wrangler pages deployment tail` 观察生产请求。

- [ ] **Step 7: 提交**

```bash
git add functions/api/gongyi/apply.ts scripts/generate-routes.mjs package.json .gitignore
git commit -m "feat(gongyi): 申请接口、Pages Functions 路由限定与本地联调"
```

---

### Task 8: 收录、部署验证与上线

**Files:**
- Modify: `src/app/sitemap.ts`、`deploy.sh`

**Interfaces:**
- Consumes: Task 5 的路由、Task 7 的接口
- Produces: 线上可用的 `https://404-found.uk/gongyi/`

- [ ] **Step 1: 加进 sitemap 与部署验证清单**

`src/app/sitemap.ts` 的返回数组里，`{ url: `${site.url}/tools` },` 之后加一行（保持该文件只列中文 URL 的现有约定）：

```ts
    { url: `${site.url}/gongyi` },
```

`deploy.sh` 的验证循环加 `/gongyi/`：

```bash
for path in "/" "/blog/" "/tools/" "/about/" "/projects/" "/gongyi/" "/en/"; do
```

- [ ] **Step 2: 本地确认**

Run: `npm run build`
Run: `rg -c "/gongyi" out/sitemap.xml` → 有匹配
Run: `npm run dev` 后打开 `/sitemap.xml`，确认含 `https://404-found.uk/gongyi`

- [ ] **Step 3: 提交**

```bash
git add src/app/sitemap.ts deploy.sh
git commit -m "chore(gongyi): sitemap 收录与部署验证清单"
```

- [ ] **Step 4: 前置检查（需要你在 Cloudflare 面板完成）**

- Pages 项目 `0xff-blog` → Settings → Functions → KV namespace bindings：`GONGYI_KV`（Production 与 Preview 都绑）
- 同一页 → Variables and Secrets：`TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`（都设 Secret）
- Settings → Runtime → Fail open / closed：选 **Fail open**

未完成这步时，线上接口会返回 502（静态页面不受影响）。

- [ ] **Step 5: 部署并验证**

Run: `bash deploy.sh`（在 Linux 构建机上按你既有流程执行）
Expected: 输出里 `/gongyi/` → 200，其余路径仍全 200

Run: `curl.exe -s -o /dev/null -w "%{http_code}\n" https://404-found.uk/gongyi/` → `200`

- [ ] **Step 6: 线上冒烟**

1. 打开 `https://404-found.uk/gongyi/?utm_source=test&utm_campaign=smoke`，用真实邮箱提交。
2. 确认 Telegram 收到消息，且 `来源: test:smoke`。
3. 确认 Umami 后台出现 `gongyi_apply_success`（data 里有 source）。
4. 用同一邮箱再提交一次 → 页面显示成功，但 Telegram 不会再来一条。
5. 微信里打开 `https://404-found.uk/gongyi/` 分享链接：页面正常渲染，**正文和页头都搜不到 `wb.404-found.uk`**（顶栏的两个站外入口在公益页已隐藏）；再打开 `/tools/` 确认那两个入口仍在。

- [ ] **Step 7: 记下已知项**

- Workers KV 是最终一致（写入约 60s 内全球可见），突发并发可能绕过限流——本地测试是强一致的，线上会宽松一些。真正的闸门是人工发码，这是可接受的。
- `.dev.vars` 只用于本地，不要提交；`.gitignore` 已覆盖。
- 需要下线时：`git revert` 本批提交 + `bash deploy.sh`。

---

## 自检记录

- **spec 覆盖**：页面（Task 4/5）、表单（Task 6）、接口契约与错误码（Task 7）、KV 用途（Task 7）、归因与埋点（Task 2/5/6）、构建与路由限定（Task 7）、sitemap 与部署（Task 8）、一次性配置与坏状态（Task 7/8）、验收（Task 4/5/6/7/8 各自的验证步骤）。spec 里「表单不引 Turnstile」→ 全文无 Turnstile。
- **类型一致性**：`ApplyPayload` 的五个字段（`email/source/ref/hp/elapsed`）在 Task 1 定义、Task 6 客户端发出、Task 7 服务端消费，名称与类型一致；`Attribution` 只有 `source/ref` 两个字段，Task 2/5/6 一致；事件名常量只在 Task 1 定义、Task 5/6 引用；`GongyiSectionId` 与 `labels` 的键一一对应。
- **超出 spec 的必要改动**（都已回写进 spec）：
  - `src/styles/components.css` 追加 `.apply-form*`：表单需要输入框样式，仓库里只有搜索框样式。
  - `src/lib/about.ts` 抽出 `splitMarkdownSections`：避免复制 30 行。
  - `src/components/site-header.tsx` 在公益页隐藏顶栏站外入口：原文的硬约束是「`/gongyi/` 上不出现 `wb.404-found.uk`」，但顶栏「控制台」入口站内每页都有，而 `/gongyi/` 正是要分享进微信的那一页——不隐藏就等于页头在泄露公益站域名。因此构建产物的核对标准是「`out/gongyi/index.html` 出现 0 次，`out/tools/index.html` 仍为 1 次」。
- **计划自身修正**：删掉了 Task 5 里重复出现的占位说明（只留在 Step 3）；Task 7 的「静态路径不经过 Function」改为可本地验证的写法（原写法混用了只对生产部署有效的 `wrangler pages deployment tail`）。
