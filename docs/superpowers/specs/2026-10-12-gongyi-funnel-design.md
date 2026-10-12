# 公益站导流位与邀请码申请入口

日期：2026-10-12
状态：已实施并上线；当日增补「L站 ID + 申请原因 + 规则书门槛」（见下，各部分已就地更新）
分支：`redesign/anthropic`（已合并回 `master` 并删除）

## 背景

两个站：

- 个人站 `404-found.uk`：Next 16 静态导出（`output: "export"`），Cloudflare Pages 直传 `out/`，纯静态、无限免费请求。
- 公益站 `wb.404-found.uk/hb`：自建 Next SSR + Python worker，邀请制免费 AI 接口；注册必须邀请码，等级 / 积分 / 密钥 / 防滥用见 `E:\Droid\specs\2026-10-12-v2-plan.md`。

漏斗：社交流量（论坛、社交平台发帖）→ `404-found.uk/gongyi/` → 读规则书、勾选同意，填 L站用户 ID + 邮箱 + 申请原因 → 你收到 Telegram 通知 → 你人工把邀请码发到邮箱 → 对方注册公益站。

私域（微信）这一轮不做，但路径为它留好了：申请表单和邮件出口就是把人接住的位置，后续加一个可选微信号字段即可。

## 目标

1. 新建可对外分享的落地页 `/gongyi/`（中英双语），说明公益站是什么、怎么用、边界在哪，并提供申请入口。
2. 申请走站内接口，你收到 Telegram 推送后人工发码。
3. 每次申请都带来源渠道，让你能判断哪条渠道真的产出人。
4. 不改变现有静态导出与部署方式。

## 不做什么

- 不做微信入口模块（个人号 / 群二维码），后续单独一轮。
- 不做自动发码、不做申请列表后台、不做邮件自动回复。
- 不改公益站任何东西（`wb-site`、`wb-claim`、面板）。
- 不写内容（本轮不发文章），只做页面与通路。

## 硬约束

1. **`/gongyi/` 页面上不出现任何指向 `wb.404-found.uk` 的可点链接或明文地址。** 公益站地址与邀请码只出现在你发出的邮件里。理由是两站共用注册域名，微信封的是整个 `404-found.uk`。
2. `output: "export"` 不变；Function 只挂在 `/api/*`，静态页面不触发 Function，保住无限免费请求与静态可用性。
3. 中英双语，`dict.zh` 与 `dict.en` 键必须对齐（`tests/i18n.test.mjs` 强制）。
4. 申请收 **L站用户 ID、邮箱、申请原因** 三栏，都必填；微信号字段留到私域那一轮再加。
5. 服务端不落邮箱明文（只存 sha256 哈希用于去重）。

## 页面

路由：`/gongyi/`（中文）、`/en/gongyi/`（英文）。主导航加一项（中文 `公益接口`，英文 `Free API`，放末位）。

| 区块 | 中文草稿 | 说明 |
| --- | --- | --- |
| 页头 | label `Gongyi` · h1 `邀请制公益 AI 接口` · lede 一句话 | 走 `pageMeta({ path: "/gongyi" })` |
| 这是什么 | `## 这是什么` | 谁在做、为什么做、不收费也不承诺 SLA |
| 能拿到什么 | `## 能拿到什么` | **只写一句「具体额度、模型池与等级规则，拿到邀请码登录后可见」**，不公开任何数字 |
| 怎么用 | `## 怎么用` | 五步：读规则书 → 填三栏申请 → 收邮件邀请码 → 注册登录 → 建密钥 |
| 规则书 | `## 规则书` | 完整规则正文（能用来做什么 / 不能做什么 / 账号与额度 / 隐私 / 风险与边界）。**不再作为独立分节渲染**：它仍写在 markdown 里，由视图取出来放进申请区，渲染成可折叠 `<details>`，申请前必须勾选同意 |
| 申请邀请码 | 表单 | 见下 |
| 页脚说明 | 隐私说明 | 邮箱仅用于发送邀请码，可要求删除 |

文案源：`content/gongyi.md` 与 `content/en/gongyi.md`，frontmatter 取 `title` / `subtitle` / `description`，正文按 `##` 分节渲染（照 `src/lib/about.ts` 的既有做法）；界面文案（label、表单、错误）进 `dict.gongyi`。

分节契约：`GONGYI_SECTION_ORDER = ["what", "gain", "how"]`（rules 不在其中），`GONGYI_SECTION_HEADINGS` 里 `rules` 的标题为 `规则书` / `Rulebook`，且它必须是 markdown 里的最后一个 `##` 小节——`tests/gongyi-content.test.mjs` 按这个形状断言。

页面不含评论区（Giscus），OG 图沿用默认 `og/default.png`，不新增图片生成脚本。页头放一个锚点到 `#apply` 的按钮，作为 `gongyi_cta_click` 的埋点位置。

### 申请表单

`src/components/apply-form.tsx`（client），字段顺序即页面阅读顺序：

- L站用户 ID（必填、`type="text"`、2–32 位 `[A-Za-z0-9._-]` 且至少含一个字母或数字；接受 `@名字`、`linux.do/u/<名字>`、带 `.json` 的主页链接——客户端与服务端都先归一化再校验）
- 邮箱（必填、`type="email"`、长度 ≤254）
- 申请原因（必填、`<textarea rows={5}>`、trim 后 10–300 字）
- 勾选框「我已阅读并同意规则书」：**未勾选时提交按钮 `disabled`**，不可能投递
- 蜜罐字段：名为 `website` 的文本框（请求体里对应 `hp`），视觉隐藏（`position:absolute;left:-9999px`）+ `tabIndex={-1}` + `autoComplete="off"` + `aria-hidden`
- 提交按钮 + 状态区：`idle` / `submitting`（禁用按钮）/ `success` / `error`
- 成功文案：`已收到，我会尽快把邀请码发到这个邮箱，注意查收垃圾邮件。`
- 字段校验文案：L站 ID →「请填 linux.do 的用户名或数字 ID。」；邮箱 →「请填一个能收信的邮箱。」；原因 →「申请原因请写 10–300 字。」
- 失败文案按错误区分：限流 →「提交太频繁了，请稍后再试」；其他 →「提交失败，请稍后重试」
- 提交时带 `luser`、`reason`、`agree`、`source`、`ref`（见归因）与 `elapsed`（组件挂载到提交的毫秒数）
- 成功与失败的判定只看 HTTP 状态；字段校验用 `src/lib/apply.ts` 的同一份函数，避免客户端与服务端规则漂移

## 接口

`functions/api/gongyi/apply.ts` → `POST /api/gongyi/apply`

请求（JSON，body ≤2KB）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `email` | 是 | 待校验的邮箱 |
| `luser` | 是 | L站用户 ID（linux.do 用户名或数字 ID）；服务端先归一化（去 `@`、从 `/u/<名字>` 链接里抠出名字、去 `.json`）再校验，不合法返回 `invalid_luser` |
| `reason` | 是 | 申请原因；trim 后 10–300 字，不合法返回 `invalid_reason` |
| `agree` | 是 | 必须**显式**为 `true`（勾选了同意规则书）；否则返回 `must_agree` |
| `source` | 否 | 归因串；服务端仍按字符白名单过滤并截断 64 字符 |
| `ref` | 否 | 来源页 host（客户端取 `document.referrer`，服务端再次过滤与截断 64 字符） |
| `hp` | 否 | 蜜罐字段值，正常提交为空串；**缺失按空串处理**，不为它单独报错（否则等于告诉刷子蜜罐在哪） |
| `elapsed` | 否 | 表单停留毫秒数；缺失或非数字时**跳过时序判定**，不因客户端问题误拦真人 |

Origin 白名单：`https://404-found.uk`（取自 `src/lib/site-core.json` 的 `url`）与本地 `http://localhost:8788`、`http://127.0.0.1:8788`。浏览器 POST 一定带 `Origin`；非浏览器客户端不带，会被 403 拒掉，所以本地 curl 测试必须显式带上 `-H "Origin: http://localhost:8788"`。

响应：

| 码 | body | 触发 |
| --- | --- | --- |
| 200 | `{"ok":true}` | 正常受理；也用于蜜罐命中、停留过短、重复邮箱（对外一律同样的成功响应） |
| 400 | `{"ok":false,"error":"invalid_email"}` 等 | body 非 JSON / 超长 / `email`、`luser`、`reason` 缺失或不合法 / `agree` 不是 `true`（错误码依次为 `invalid_email`、`invalid_luser`、`invalid_reason`、`must_agree`） |
| 403 | `{"ok":false,"error":"bad_origin"}` | `Origin` 不在白名单 |
| 405 | 方法不是 POST | 带 `Allow: POST` |
| 429 | `{"ok":false,"error":"rate_limited"}` | 同 IP 超限 |
| 502 | `{"ok":false,"error":"notify_failed"}` | Telegram 推送失败，让访客重试 |

处理顺序：方法 → Origin → body 大小（先按 `content-length` 粗筛，读完再复核实际长度）→ **KV 限流（先计数再判定，刷子也要计入）** → body 解析 → 字段校验（邮箱 → L站 ID → 申请原因 → 同意勾选）→ 蜜罐 / 时序（命中即 200 静默返回）→ 邮箱去重查询（命中即 200，不再通知）→ Telegram 推送 → **推送成功才写去重标记**。

两处顺序是刻意的（实现复查时裁决，2026-10-12）：

- **大小检查排在限流之前**：超大 body 完全不碰 KV。反过来的话，单 IP 洪水的并发写会撞上「KV 同 key 每秒 1 次写」的限制，写失败走 fail-open（`count=0`）反而让洪水全部放行——KV 成本付了，保护却没有。所谓「先计数再判定」针对的是客户端**可伪造**的判定（蜜罐、时序），大小是服务端可观测的硬属性。为兜住 `request.text()` 的缓冲开销，读 body 前先用 `content-length` 粗筛一次（阈值 `BODY_MAX * 4`；UTF-8 最坏情况是每个 UTF-16 码元 3 字节，取 4 倍保证不会误杀长度复核会放行的请求）。
- **去重标记在推送成功后才写**：若先写标记，任何一次 502（包括凭据还没配好）都会把这位访客的邮箱在 24 小时内标成「已申请」，他重试拿到的是 200，而没有任何人收到通知——正是「不静默丢申请」要防的情形。代价：去重命中路径要有一次成功推送才能验证，挪到生产冒烟里测。

`BODY_MAX` 从 1024 提到 2048，是为容纳三栏字段加 JSON 结构开销；`content-length` 粗筛的 4 倍关系不变。

KV 用途（绑定名 `GONGYI_KV`）：

| key | value | TTL | 用途 |
| --- | --- | --- | --- |
| `rl:<ip>` | 计数数字 | 3600s | 同 IP 每小时上限 3 次 |
| `em:<sha256(email)>` | `1` | 86400s | 24 小时同邮箱去重；只在推送成功后写入 |

IP 取 `CF-Connecting-IP`，缺失时退到 `Unknown`（不因此放行或拦截）。

`Origin` 白名单：`site-core.json` 里的站点 origin、`http://localhost:8788`、`http://127.0.0.1:8788`、`https://0xff-blog.pages.dev`。加 pages.dev 是因为 Cloudflare 控制台与构建结果里给的就是它，从那里打开页面时表单也要能提交。这不放松跨站防护：`Origin` 由浏览器按页面自身来源填写，别的站点无法借它冒充。

Telegram 消息（纯文本，不用 `parse_mode`，避免转义问题）：

```
新的邀请码申请
邮箱: x@y.z
L站ID: zenix
申请原因:
（申请原因全文，多行原样输出）
来源: v2ex:launch
Referrer: tieba.baidu.com
地区: CN · 2026-10-12 14:03 UTC
```

`L站ID` 与 `申请原因` 即使为空也固定占位（字段位置稳定，缺内容一眼看得出）；`来源` / `Referrer` 仍按既有约定省略空行。

`地区` 取 `request.cf.country`，缺失时记 `??`；时间为 UTC。

## 本地联调

- `npm run build` 后 `npx wrangler pages dev out --kv GONGYI_KV`（本地模拟 KV）。
- Telegram 凭据放项目根 `.dev.vars`（`wrangler pages dev` 会自动读取），已加进 `.gitignore`。
- 用 `curl.exe -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"a@b.co\",\"luser\":\"zenix\",\"reason\":\"这是一个足够长的申请原因示例文本。\",\"agree\":true,\"hp\":\"\",\"elapsed\":5000}"` 逐条跑验收里的对抗用例。

## 归因与埋点

- `src/lib/attribution.ts`：落地时读 URL 的 `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term`，首次带 UTM 的落点写入 `localStorage["gongyi.attribution"]`（30 天，first touch），后续访问不覆盖。没有 UTM 时用 `document.referrer` 的 host，同域或空则回退到已存的首次来源，都没有记 `direct`。
- `source` 组装：`utm_source`，有 `utm_campaign` 时拼成 `source:campaign`；只保留 `[a-z0-9._:-]`，截断 64 字符。
- 发帖按渠道给不同链接，例如 `https://404-found.uk/gongyi/?utm_source=v2ex&utm_campaign=launch`。
- `src/lib/analytics.ts`：`window.umami?.track` 的安全包装，Umami 未加载时静默跳过。

| 事件 | 触发 | data |
| --- | --- | --- |
| `gongyi_cta_click` | 点击页面上跳到表单的按钮 | `{ source }` |
| `gongyi_apply_submit` | 表单发起请求 | `{ source }` |
| `gongyi_apply_success` | 收到 200 | `{ source }` |
| `gongyi_apply_error` | 400 / 403 / 429 / 502 / 网络错误 | `{ source, reason }` |

## 文件清单

### 新增

| 路径 | 职责 |
| --- | --- |
| `functions/api/gongyi/apply.ts` | 接口；从 `src/lib/apply.ts` 引纯逻辑，从 `src/lib/site-core.json` 引站点源 |
| `src/lib/apply.ts` | 纯函数：邮箱 / L站 ID / 申请原因校验与归一化、蜜罐 / 时序判定、归因归一化、限流判定、Telegram 文案、事件名常量、Origin 白名单 |
| `src/lib/attribution.ts` | 浏览器侧首次归因读写 |
| `src/lib/analytics.ts` | Umami 事件安全包装 |
| `src/lib/gongyi-content.ts` | 读 `content/gongyi.md` 分节并渲染，照 `lib/about.ts` |
| `src/views/gongyi.tsx` | 页面 UI：分节 + 规则书折叠块 + 表单 + 隐私说明 |
| `src/components/apply-form.tsx` | 申请表单（client，三栏 + 勾选门槛） |
| `src/app/gongyi/page.tsx`、`src/app/en/gongyi/page.tsx` | 双语壳 |
| `content/gongyi.md`、`content/en/gongyi.md` | 页面文案（含规则书全文） |
| `scripts/generate-routes.mjs` | 生成 `out/_routes.json`（`{"version":1,"include":["/api/*"],"exclude":[]}`） |
| `tests/apply.test.mjs` | 纯逻辑单测 |

### 改动

| 路径 | 改什么 |
| --- | --- |
| `src/lib/i18n.ts` | `dict.zh/en` 加 `gongyi`（页面 + 表单 + 错误文案，含三栏标签与勾选文案），`nav` 各加一项 |
| `src/lib/gongyi-sections.ts` | 分节契约：`GONGYI_SECTION_ORDER` 去掉 `rules`，`rules` 标题改「规则书 / Rulebook」 |
| `package.json` | `build` 链追加 `node scripts/generate-routes.mjs` |
| `src/app/sitemap.ts` | 加 `${site.url}/gongyi`（保持只列中文的现有约定） |
| `deploy.sh` | 验证列表加 `/gongyi/` |
| `src/styles/components.css` | 公益页样式块：`.apply-form*`（三栏统一输入框外观、字段间距 18px、勾选行、`.apply-rules` 折叠块、`.apply-note` 上间距 20px） |
| `src/components/site-header.tsx` | `/gongyi/` 与 `/en/gongyi/` 上不渲染 `site.apps`（Gitea / 控制台）：这一页会被分享进微信，页头不能出现公益站域名 |
| `.gitignore` | 加 `.dev.vars`（本地测试用的 Telegram 凭据不能进仓库；现有 `.env*` 规则不覆盖它） |

不改：`next.config.ts`、`src/app/layout.tsx`、现有页面与视图（`src/lib/about.ts` 只做一处纯抽取：把 `splitMarkdownSections` 移到共用模块）。

## 一次性配置（已完成，2026-10-12）

实际落地状态（当时由助手用项目根 `.cf-env` 里的 token 代操作，改名/改值请以此表为核对依据）：

1. **Telegram**：bot `@memeally_bot`；`TELEGRAM_CHAT_ID = 7792968753`（`getChat` 验证为私聊 `Zenix_ally`）。注意该 bot 同时被另一个实例轮询 `getUpdates`，与本站无关——本站只用 `sendMessage`，不占用 `getUpdates`。
2. **KV**：新建专用 namespace `gongyi-kv`，id `cae7b1501f4a4b0e80323fa7f942e98e`。
3. **绑定**：Pages 项目 `0xff-blog` 的 Production 与 Preview 都绑为 `GONGYI_KV`。
4. **密钥**：Production 与 Preview 都写入 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`（Secret）；Production 原有的 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_REDIRECT_URI` 保持不变（PATCH 为合并语义，已在 Preview 上实验证明）。
5. **Fail open**：两个环境本来就是开启状态，未改动。

## 坏状态

- `GONGYI_KV` 未绑定或读写失败：跳过限流与去重，照常推送 Telegram，仍返回 200（降级放行；宁可收到，也不要丢线索）。
- `TELEGRAM_*` 未配置或推送失败：返回 502，前端提示重试；不静默丢申请，也不把邮箱明文落盘当补偿队列。去重标记只在推送成功后才写，所以失败后重试仍会重新推送。日志只记固定串、HTTP 状态与 Telegram 的 `description`（不含 token、不含邮箱）。
- 访客 JS 未加载：表单不可用，页面文字仍静态可读。规则书正文在折叠态也照常输出在 HTML 里，因此禁用 JS 时正文仍可读，勾选框与提交按钮不可用是预期行为。
- 未勾选同意、或三栏任一不合法：400（`must_agree` / `invalid_luser` / `invalid_reason` / `invalid_email`），表单就地提示，不消耗通知。
- 蜜罐命中 / 停留 <3 秒 / 重复邮箱：一律 200 且不推送，不给刷子任何反馈。
- `out/_routes.json` 缺失：Function 会覆盖全部路径，静态请求也计入 Function 额度；构建脚本必须保证生成，部署后用 `wrangler pages deployment tail` 抽查静态路径不触发 Function。
- Umami 未加载：埋点静默跳过，不影响申请。

## 怎么知道做对了

自动：

- `npx tsc --noEmit` 零错误。
- `npm test`：`tests/apply.test.mjs` 覆盖邮箱校验（合法 / 非法 / 超长 / 含换行）、L站 ID 校验（缺字段 / `@名字` / 主页链接与 `.json` / 空格与中文 / 1 字符 / 33 字符 / 纯符号）、申请原因长度（9 / 10 / 300 / 301 / 缺失 / 前后空白）、同意勾选（缺失 / false / true）、蜜罐与停留判定、归因归一化（UTM 优先级、referrer 兜底、字符白名单、64 截断）、限流判定（第 3 次通过、第 4 次拦住）、Telegram 文案拼装（含 `L站ID` 与 `申请原因` 行、来源为空时省略）；`tests/i18n.test.mjs` 覆盖新字典键对齐；`tests/gongyi-content.test.mjs` 覆盖两份文案的标题契约、规则书小节非空与硬约束域名。
- `npm run build` 成功，且 `out/gongyi/index.html`、`out/en/gongyi/index.html`、`out/_routes.json`（内容含 `"/api/*"`）都在；两份产物里 `wb.404-found.uk` / `git.404-found.uk` 出现次数为 0，且都能搜到 `name="luser"`、`name="reason"`、`type="checkbox"`、`class="apply-rules"`。

对抗测试（按「本地联调」起服务，curl 需带 `Origin` 头）：

- 正常提交 → 200 且 Telegram 收到一条，消息含 `来源`、`L站ID` 与申请原因全文。
- 蜜罐填值 → 200 且 Telegram 无新消息。
- 停留 <3 秒 → 同上。
- 同 IP 连发 4 次 → 第 4 次 429。
- 同邮箱重复提交 → 200，Telegram 只收到一次。
- 缺 L站 ID → 400 `invalid_luser`；原因 9 字 → 400 `invalid_reason`；`agree` 缺失 → 400 `must_agree`；非法邮箱 → 400；GET → 405；跨站 `Origin` → 403；body 超限 → 400。
- 不绑 KV 启动 → 仍 200 且 Telegram 收到（降级）。

生产（2026-10-12 已执行）：

- 部署 `67f983fa`（`--branch main`）后 `/gongyi/`、`/en/gongyi/`、`/tools/` 均 200；公益页域名出现次数 0/0，`/tools/` 仍保留两个站外入口。
- 未勾选同意的 POST → 400 `must_agree`；`smoke-test-2@example.com` 的真实三栏提交 → 200（2.65s），KV 出现对应 `em:` 键（该键只在推送成功后写，等于证明 Telegram 已送达）。
- 在 `/gongyi/?utm_source=test&utm_campaign=smoke` 提交一次，Telegram 消息里 `来源: test:smoke`。
- Umami 后台能看到 `gongyi_apply_success`，且带 source（本机网络到不了 `cloud.umami.is`，此项待你在自己的浏览器里确认）。

人工：

- 微信里打开 `404-found.uk/gongyi/` 的分享链接：页面正常渲染，页面上搜不到 `wb.404-found.uk`。
- 导航出现「公益接口」，中英切换后停在 `/en/gongyi/`；深浅主题与 ≤760px 移动端布局正常。
- 表单在手机上可填可提交：未勾选时按钮是灰的，勾选后能点；成功后状态文案正确。
- 按钮下方的小字与按钮之间留白正常（20px），三栏之间 18px。

## 已知项与风险

- 顶栏「控制台」（`site.apps`）指向 `https://wb.404-found.uk/`，其余页面保留；**`/gongyi/` 与 `/en/gongyi/` 上不渲染这两个站外入口**，让被分享进微信的那一页全文不含公益站域名（有构建产物检查守着）。站点共用的 JS chunk 里仍存在公益站域名字面量（全站既有现象），本轮按用户决定不处理，记为已知项。
- 公开页面必然招爬虫与白嫖；蜜罐 + 时序 + IP 限流只是放缓，**真正的闸门是你手动发码**。另外 Workers KV 最终一致（写入约 60s 全球可见），突发并发可能绕过限流。
- 福利不落数字（只写「邀请后可见」），降低被举报与攀比的风险。
- 规则书是行为约定（禁止转售 / 多开 / 违法用途、异常停用与封禁、免费无 SLA），**不包含任何额度、模型池与等级数字**，与「福利不落数字」一致。
- 需要下线时：`git revert` 对应提交 + `bash deploy.sh`，一条命令恢复。
- `content/tools.md` 与 `content/en/tools.md` 已无引用（工具数据早已搬进 `src/lib/tools.ts`），本轮不动，仅作为顺手的清理候选记录在此。
- 计划阶段补出的支撑模块（不是新增能力，只是拆分）：`src/lib/markdown-sections.ts`（从 `about.ts` 抽出的共用分节函数）、`src/lib/gongyi-sections.ts`（文案标题与分节的契约，供测试校验）、`src/lib/capture.ts`（浏览器侧归因胶水）、`src/components/gongyi-cta.tsx`（页头 CTA 与点击埋点）。
