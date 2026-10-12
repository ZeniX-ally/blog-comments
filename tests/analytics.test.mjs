import test from "node:test";
import assert from "node:assert/strict";
import { track } from "../src/lib/analytics.ts";
import {
  EVENT_BODY_MAX,
  PLAUSIBLE_EVENT_URL,
  PLAUSIBLE_SCRIPT_URL,
  handleEventProxy,
  handleScriptProxy,
} from "../src/lib/analytics-proxy.ts";

const ORIGIN = "https://404-found.uk";

/** 真实策略在 src/lib/allowed-origins.ts（那里有 JSON 导入，Node 加载不了），这里用等价实现 */
const policy = (origin) => origin === ORIGIN;

/** 假上游：记录每次 fetch 的参数，并返回指定响应 */
function upstream(response) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    return response;
  };
  return { calls, fetcher };
}

function eventRequest({
  origin = ORIGIN,
  method = "POST",
  body = '{"n":"pageview","u":"https://404-found.uk/gongyi/"}',
  headers = {},
} = {}) {
  const h = new Headers({ "content-type": "application/json", ...headers });
  if (origin !== null) h.set("origin", origin);
  return new Request("https://404-found.uk/api/event", {
    method,
    headers: h,
    body: method === "POST" ? body : undefined,
  });
}

function withWindow(value, fn) {
  const had = "window" in globalThis;
  const prev = globalThis.window;
  globalThis.window = value;
  try {
    fn();
  } finally {
    if (had) globalThis.window = prev;
    else delete globalThis.window;
  }
}

test("track 在服务端（无 window）静默返回", () => {
  assert.doesNotThrow(() => track("gongyi_apply_success", { source: "test" }));
});

test("track 在没有 plausible（未加载/被拦截）时静默返回", () => {
  withWindow({}, () => {
    assert.doesNotThrow(() => track("gongyi_apply_success", { source: "test" }));
  });
});

test("track 把事件名与属性交给 window.plausible", () => {
  const calls = [];
  withWindow({ plausible: (event, options) => calls.push([event, options]) }, () => {
    track("gongyi_apply_success", { source: "apply-page", retries: 0, ok: true });
  });
  assert.deepEqual(calls, [
    ["gongyi_apply_success", { props: { source: "apply-page", retries: 0, ok: true } }],
  ]);
});

test("track 不传属性时只给事件名", () => {
  const calls = [];
  withWindow({ plausible: (event, options) => calls.push([event, options]) }, () => {
    track("gongyi_cta_click");
  });
  assert.deepEqual(calls, [["gongyi_cta_click", undefined]]);
});

test("track 吞掉 plausible 抛出的异常，绝不影响主流程", () => {
  withWindow(
    {
      plausible: () => {
        throw new Error("boom");
      },
    },
    () => {
      assert.doesNotThrow(() => track("gongyi_apply_error", { reason: "network" }));
    },
  );
});

test("事件代理：合法 POST 转发到 Plausible，并带上客户端 IP 与 UA", async () => {
  const { calls, fetcher } = upstream(new Response(null, { status: 202 }));
  const res = await handleEventProxy(
    eventRequest({ headers: { "cf-connecting-ip": "1.2.3.4", "user-agent": "Mozilla/5.0 Test" } }),
    policy,
    fetcher,
  );

  assert.equal(res.status, 202);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, PLAUSIBLE_EVENT_URL);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, '{"n":"pageview","u":"https://404-found.uk/gongyi/"}');
  assert.equal(calls[0].init.headers["x-forwarded-for"], "1.2.3.4");
  assert.equal(calls[0].init.headers["user-agent"], "Mozilla/5.0 Test");
  assert.match(calls[0].init.headers["content-type"], /application\/json/);
});

test("事件代理：未接来源策略时默认全丢（fail-safe，不会误转发）", async () => {
  const res = await handleEventProxy(eventRequest());
  assert.equal(res.status, 202);
});

test("事件代理：来源不在白名单时静默丢弃（不转发，也不报错）", async () => {
  const { calls, fetcher } = upstream(new Response(null, { status: 202 }));
  const res = await handleEventProxy(eventRequest({ origin: "https://evil.example" }), policy, fetcher);
  assert.equal(res.status, 202);
  assert.equal(calls.length, 0);
});

test("事件代理：没有 Origin 头也丢弃", async () => {
  const { calls, fetcher } = upstream(new Response(null, { status: 202 }));
  const res = await handleEventProxy(eventRequest({ origin: null }), policy, fetcher);
  assert.equal(res.status, 202);
  assert.equal(calls.length, 0);
});

test("事件代理：非 POST 返回 405 且不转发", async () => {
  const { calls, fetcher } = upstream(new Response(null, { status: 202 }));
  for (const method of ["GET", "PUT", "DELETE", "OPTIONS"]) {
    const res = await handleEventProxy(eventRequest({ method }), policy, fetcher);
    assert.equal(res.status, 405, method);
    assert.equal(res.headers.get("allow"), "POST", method);
  }
  assert.equal(calls.length, 0);
});

test("事件代理：空 body 与超长 body 直接丢弃", async () => {
  const { calls, fetcher } = upstream(new Response(null, { status: 202 }));
  const empty = await handleEventProxy(eventRequest({ body: "" }), policy, fetcher);
  const huge = await handleEventProxy(
    eventRequest({ body: `{"a":"${"x".repeat(EVENT_BODY_MAX)}"}` }),
    policy,
    fetcher,
  );
  assert.equal(empty.status, 202);
  assert.equal(huge.status, 202);
  assert.equal(calls.length, 0);
});

test("事件代理：上游报错或抛异常时仍然返回 202，埋点不影响页面", async () => {
  const failing = upstream(new Response("nope", { status: 500 }));
  const throwing = {
    fetcher: async () => {
      throw new Error("network down");
    },
  };
  assert.equal((await handleEventProxy(eventRequest(), policy, failing.fetcher)).status, 202);
  assert.equal((await handleEventProxy(eventRequest(), policy, throwing.fetcher)).status, 202);
});

test("脚本代理：返回脚本本体与缓存头", async () => {
  const script = "window.plausible=()=>{};";
  const { calls, fetcher } = upstream(
    new Response(script, { status: 200, headers: { "content-type": "text/javascript" } }),
  );
  const res = await handleScriptProxy(new Request("https://404-found.uk/js/script.js"), fetcher);

  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") ?? "", /application\/javascript/);
  assert.match(res.headers.get("cache-control") ?? "", /max-age=\d+/);
  assert.equal(await res.text(), script);
  assert.equal(calls[0].url, PLAUSIBLE_SCRIPT_URL);
});

test("脚本代理：上游失败返回 502 且不缓存", async () => {
  const notOk = upstream(new Response("", { status: 404 }));
  const throwing = {
    fetcher: async () => {
      throw new Error("network down");
    },
  };
  for (const fetcher of [notOk.fetcher, throwing.fetcher]) {
    const res = await handleScriptProxy(new Request("https://404-found.uk/js/script.js"), fetcher);
    assert.equal(res.status, 502);
    assert.equal(res.headers.get("cache-control"), "no-store");
  }
});

test("脚本代理：非 GET/HEAD 返回 405", async () => {
  const { calls, fetcher } = upstream(new Response("", { status: 200 }));
  const res = await handleScriptProxy(
    new Request("https://404-found.uk/js/script.js", { method: "POST" }),
    fetcher,
  );
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("allow"), "GET, HEAD");
  assert.equal(calls.length, 0);
});
