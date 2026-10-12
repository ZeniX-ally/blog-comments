import test from "node:test";
import assert from "node:assert/strict";
import {
  BODY_MAX,
  EMAIL_MAX,
  LUSER_MAX,
  RATE_LIMIT,
  REASON_MAX,
  REASON_MIN,
  SOURCE_MAX,
  deriveAttribution,
  isAllowedOrigin,
  isRateLimited,
  isSpam,
  isValidEmail,
  isValidLuser,
  isValidReason,
  normalizeEmail,
  normalizeLuser,
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
      luser: "@Zenix",
      reason: "  想学习一下，谢谢大佬们  ",
      agree: true,
      source: "V2EX:Launch",
      ref: "https://tieba.baidu.com/p/1",
      hp: "",
      elapsed: 8000,
    }),
  );
  assert.equal(out.ok, true);
  assert.deepEqual(out.payload, {
    email: "a@b.co",
    luser: "Zenix",
    reason: "想学习一下，谢谢大佬们",
    source: "v2ex:launch",
    ref: "tieba.baidu.com",
    hp: "",
    elapsed: 8000,
  });
});

test("parseApplyPayload：缺 hp / elapsed 走安全默认值", () => {
  const out = parseApplyPayload(
    JSON.stringify({ email: "a@b.co", luser: "zenix", reason: "这是一段合法的申请原因", agree: true }),
  );
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

test("telegramText 组装通知内容，含 L站ID 与申请原因，缺来源时不输出该行", () => {
  const now = new Date("2026-10-12T14:03:00Z");
  assert.equal(
    telegramText({
      email: "a@b.co",
      luser: "zenix",
      reason: "想学习一下，谢谢大佬们",
      source: "v2ex:launch",
      ref: "tieba.baidu.com",
      country: "CN",
      now,
    }),
    [
      "新的邀请码申请",
      "邮箱: a@b.co",
      "L站ID: zenix",
      "申请原因:",
      "想学习一下，谢谢大佬们",
      "来源: v2ex:launch",
      "Referrer: tieba.baidu.com",
      "地区: CN · 2026-10-12 14:03 UTC",
    ].join("\n"),
  );
  const bare = telegramText({ email: "a@b.co", now });
  assert.equal(bare.includes("来源"), false);
  assert.equal(bare.includes("Referrer"), false);
  assert.equal(bare.includes("地区: ?? · 2026-10-12 14:03 UTC"), true);
});

test("normalizeLuser：去 @、去空白，并从 linux.do 链接抠出用户名", () => {
  assert.equal(normalizeLuser("  @zenix  "), "zenix");
  assert.equal(normalizeLuser("zenix"), "zenix");
  assert.equal(normalizeLuser("Zenix"), "Zenix");
  assert.equal(normalizeLuser("https://linux.do/u/zenix"), "zenix");
  assert.equal(normalizeLuser("https://linux.do/u/zenix.json"), "zenix");
  assert.equal(normalizeLuser("linux.do/u/zenix"), "zenix");
  assert.equal(normalizeLuser("/u/zenix"), "zenix");
  assert.equal(normalizeLuser("https://linux.do/u/zenix/"), "zenix");
  assert.equal(normalizeLuser(123), "");
  assert.equal(normalizeLuser(null), "");
});

test("isValidLuser：长度 2–32、字符白名单、至少含一个字母数字", () => {
  assert.equal(isValidLuser("zenix"), true);
  assert.equal(isValidLuser("@zenix"), true);
  assert.equal(isValidLuser("a.b-c_1"), true);
  assert.equal(isValidLuser("z"), false); // 1 个字符
  assert.equal(isValidLuser("z".repeat(LUSER_MAX)), true);
  assert.equal(isValidLuser("z".repeat(LUSER_MAX + 1)), false); // 33 个字符
  assert.equal(isValidLuser(".."), false);
  assert.equal(isValidLuser("--"), false);
  assert.equal(isValidLuser("含 空格"), false);
  assert.equal(isValidLuser("中文用户"), false);
  assert.equal(isValidLuser(123), false);
});

test("isValidReason：trim 后长度落在 [REASON_MIN, REASON_MAX]", () => {
  assert.equal(isValidReason("a".repeat(REASON_MIN)), true);
  assert.equal(isValidReason("a".repeat(REASON_MIN - 1)), false);
  assert.equal(isValidReason("a".repeat(REASON_MAX)), true);
  assert.equal(isValidReason("a".repeat(REASON_MAX + 1)), false);
  assert.equal(isValidReason(`  ${"a".repeat(REASON_MIN)}  `), true);
  assert.equal(isValidReason(undefined), false);
  assert.equal(isValidReason(123), false);
});

test("parseApplyPayload：luser 各类非法值 → invalid_luser", () => {
  const base = { email: "a@b.co", reason: "这是一段合法的申请原因", agree: true };
  for (const luser of [undefined, "z", "z".repeat(LUSER_MAX + 1), "含 空格", "中文用户", ".."]) {
    assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base, luser })), {
      ok: false,
      error: "invalid_luser",
    });
  }
});

test("parseApplyPayload：luser 归一化；@ 前缀与 linux.do 链接都能通过", () => {
  const base = { email: "a@b.co", reason: "这是一段合法的申请原因", agree: true };
  assert.equal(
    parseApplyPayload(JSON.stringify({ ...base, luser: "@zenix" })).payload.luser,
    "zenix",
  );
  assert.equal(
    parseApplyPayload(JSON.stringify({ ...base, luser: "https://linux.do/u/zenix.json" })).payload
      .luser,
    "zenix",
  );
});

test("parseApplyPayload：reason 边界与 trim；缺失 → invalid_reason", () => {
  const base = { email: "a@b.co", luser: "zenix", agree: true };
  assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base, reason: "a".repeat(9) })), {
    ok: false,
    error: "invalid_reason",
  });
  assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base, reason: "a".repeat(301) })), {
    ok: false,
    error: "invalid_reason",
  });
  assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base })), {
    ok: false,
    error: "invalid_reason",
  });
  assert.equal(
    parseApplyPayload(JSON.stringify({ ...base, reason: "a".repeat(10) })).payload.reason,
    "a".repeat(10),
  );
  assert.equal(
    parseApplyPayload(JSON.stringify({ ...base, reason: "a".repeat(300) })).payload.reason,
    "a".repeat(300),
  );
  assert.equal(
    parseApplyPayload(JSON.stringify({ ...base, reason: `   ${"a".repeat(10)}   ` })).payload.reason,
    "a".repeat(10),
  );
});

test("parseApplyPayload：agree 缺失 / false → must_agree；true → 通过", () => {
  const base = { email: "a@b.co", luser: "zenix", reason: "这是一段合法的申请原因" };
  assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base })), {
    ok: false,
    error: "must_agree",
  });
  assert.deepEqual(parseApplyPayload(JSON.stringify({ ...base, agree: false })), {
    ok: false,
    error: "must_agree",
  });
  assert.equal(parseApplyPayload(JSON.stringify({ ...base, agree: true })).ok, true);
});
