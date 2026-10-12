# 公益站导流位与邀请码申请入口

日期：2026-10-12
状态：已批准，待实施
分支：`redesign/anthropic`（当前分支，直接在其上实现）

## 背景

两个站：

- 个人站 `404-found.uk`：Next 16 静态导出（`output: "export"`），Cloudflare Pages 直传 `out/`，纯静态、无限免费请求。
- 公益站 `wb.404-found.uk/hb`：自建 Next SSR + Python worker，邀请制免费 AI 接口；注册必须邀请码，等级 / 积分 / 密钥 / 防滥用见 `E:\Droid\specs\2026-10-12-v2-plan.md`。

漏斗：社交流量（论坛、社交平台发帖）→ `404-found.uk/gongyi/` → 站内填邮箱申请 → 你收到 Telegram 通知 → 你人工把邀请码发到邮箱 → 对方注册公益站。

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
- 不引新依赖，不动现有视觉体系（复用 `.content` / `.page-head` / `.label` / `.lede` / `.prose` / `.hair-list` / `.rise` 与 `Stagger`）。
- 不上 Turnstile；先蜜罐 + 时序 + IP 限流。

## 硬约束

1. **`/gongyi/` 页面上不出现任何指向 `wb.404-found.uk` 的可点链接或明文地址。** 公益站地址与邀请码只出现在你发出的邮件里。理由是两站共用注册域名，微信封的是整个 `404-found.uk`。
2. `output: "export"` 不变；Function 只挂在 `/api/*`，静态页面不触发 Function，保住无限免费请求与静态可用性。
3. 中英双语，`dict.zh` 与 `dict.en` 键必须对齐（`tests/i18n.test.mjs` 强制）。
4. 申请只收邮箱，不放微信号字段。
5. 服务端不落邮箱明文（只存 sha256 哈希用于去重）。

## 页面

路由：`/gongyi/`（中文）、`/en/gongyi/`（英文）。主导航加一项（中文 `公益接口`，英文 `Free API`，放末位）。

| 区块 | 中文草稿 | 说明 |
| --- | --- | --- |
| 页头 | label `Gongyi` · h1 `邀请制公益 AI 接口` · lede 一句话 | 走 `pageMeta({ path: "/gongyi" })` |
| 这是什么 | `## 这是什么` | 谁在做、为什么做、不收费也不承诺 SLA |
| 能拿到什么 | `## 能拿到什么` | **只写一句「具体额度、模型池与等级规则，拿到邀请码登录后可见」**，不公开任何数字 |
| 怎么用 | `## 怎么用` | 四步：申请 → 收邮件邀请码 → 注册登录 → 建密钥 |
| 边界与规则 | `## 边界与规则` | 仅限个人学习研究、禁止转售与共享密钥、违规停用、不保证可用性 |
| 申请邀请码 | 表单 | 见下 |
| 页脚说明 | 隐私说明 | 邮箱仅用于发送邀请码，可要求删除 |

文案源：`content/gongyi.md` 与 `content/en/gongyi.md`，frontmatter 取 `title` / `subtitle` / `description`，正文按 `##` 分节渲染（照 `src/lib/about.ts` 的既有做法）；界面文案（label、表单、错误）进 `dict.gongyi`。

页面不含评论区（Giscus），OG 图沿用默认 `og/default.png`，不新增图片生成脚本。页头放一个锚点到 `#apply` 的按钮，作为 `gongyi_cta_click` 的埋点位置。

### 申请表单

`src/components/apply-form.tsx`（client）：

- 邮箱（必填、`type="email"`、长度 ≤254）
- 蜜罐字段：名为 `url` 的文本框，视觉隐藏（`position:absolute;left:-9999px`）+ `tabIndex={-1}` + `autoComplete="off"` + `aria-hidden`
- 提交按钮 + 状态区：`idle` / `submitting`（禁用按钮）/ `success` / `error`
- 成功文案：`已收到，我会尽快把邀请码发到这个邮箱，注意查收垃圾邮件。`
- 失败文案按错误区分：限流 →「提交太频繁了，请稍后再试」；其他 →「提交失败，请稍后重试」
- 提交时带 `source`、`ref`（见归因）与 `elapsed`（组件挂载到提交的毫秒数）

## 接口

`functions/api/gongyi/apply.ts` → `POST /api/gongyi/apply`

请求（JSON，body ≤1KB）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `email` | 是 | 待校验的邮箱 |
| `source` | 否 | 归因串；服务端仍按字符白名单过滤并截断 64 字符 |
| `ref` | 否 | 来源页 host（客户端取 `document.referrer`，服务端再次过滤与截断 64 字符） |
| `hp` | 否 | 蜜罐字段值，正常提交为空串；**缺失按空串处理**，不为它单独报错（否则等于告诉刷子蜜罐在哪） |
| `elapsed` | 否 | 表单停留毫秒数；缺失或非数字时**跳过时序判定**，不因客户端问题误拦真人 |

Origin 白名单：`https://404-found.uk`（取自 `src/lib/site-core.json` 的 `url`）与本地 `http://localhost:8788`、`http://127.0.0.1:8788`。浏览器 POST 一定带 `Origin`；非浏览器客户端不带，会被 403 拒掉，所以本地 curl 测试必须显式带上 `-H "Origin: http://localhost:8788"`。

响应：

| 码 | body | 触发 |
| --- | --- | --- |
| 200 | `{"ok":true}` | 正常受理；也用于蜜罐命中、停留过短、重复邮箱（对外一律同样的成功响应） |
| 400 | `{"ok":false,"error":"invalid_email"}` 等 | body 非 JSON / 超长 / `email` 缺失或不合法 |
| 403 | `{"ok":false,"error":"bad_origin"}` | `Origin` 不在白名单 |
| 405 | 方法不是 POST | 带 `Allow: POST` |
| 429 | `{"ok":false,"error":"rate_limited"}` | 同 IP 超限 |
| 502 | `{"ok":false,"error":"notify_failed"}` | Telegram 推送失败，让访客重试 |

处理顺序：方法 → Origin → **KV 限流（先计数再判定，刷子也要计入）** → body 解析与大小 → 邮箱格式 → 蜜罐 / 时序（命中即 200 静默返回）→ 邮箱去重（命中即 200，不再通知）→ Telegram 推送。

KV 用途（绑定名 `GONGYI_KV`）：

| key | value | TTL | 用途 |
| --- | --- | --- | --- |
| `rl:<ip>` | 计数数字 | 3600s | 同 IP 每小时上限 3 次 |
| `em:<sha256(email)>` | `1` | 86400s | 24 小时同邮箱去重 |

IP 取 `CF-Connecting-IP`，缺失时退到 `Unknown`（不因此放行或拦截）。

Telegram 消息（纯文本，不用 `parse_mode`，避免转义问题）：

```
新的邀请码申请
邮箱: x@y.z
来源: v2ex:launch
Referrer: tieba.baidu.com
地区: CN · 2026-10-12 14:03 UTC
```

`地区` 取 `request.cf.country`，缺失时记 `??`；时间为 UTC。

## 本地联调

- `npm run build` 后 `npx wrangler pages dev out --kv GONGYI_KV`（本地模拟 KV）。
- Telegram 凭据放项目根 `.dev.vars`（`wrangler pages dev` 会自动读取），已加进 `.gitignore`。
- 用 `curl.exe -X POST http://localhost:8788/api/gongyi/apply -H "Origin: http://localhost:8788" -H "Content-Type: application/json" -d "{\"email\":\"a@b.co\",\"hp\":\"\",\"elapsed\":5000}"` 逐条跑验收里的对抗用例。

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
| `src/lib/apply.ts` | 纯函数：邮箱校验、蜜罐 / 时序判定、归因归一化、限流判定、Telegram 文案、事件名常量、Origin 白名单 |
| `src/lib/attribution.ts` | 浏览器侧首次归因读写 |
| `src/lib/analytics.ts` | Umami 事件安全包装 |
| `src/lib/gongyi-content.ts` | 读 `content/gongyi.md` 分节并渲染，照 `lib/about.ts` |
| `src/views/gongyi.tsx` | 页面 UI |
| `src/components/apply-form.tsx` | 申请表单（client） |
| `src/app/gongyi/page.tsx`、`src/app/en/gongyi/page.tsx` | 双语壳 |
| `content/gongyi.md`、`content/en/gongyi.md` | 页面文案 |
| `scripts/generate-routes.mjs` | 生成 `out/_routes.json`（`{"version":1,"include":["/api/*"],"exclude":[]}`） |
| `tests/apply.test.mjs` | 纯逻辑单测 |

### 改动

| 路径 | 改什么 |
| --- | --- |
| `src/lib/i18n.ts` | `dict.zh/en` 加 `gongyi`（页面 + 表单 + 错误文案），`nav` 各加一项 |
| `package.json` | `build` 链追加 `node scripts/generate-routes.mjs` |
| `src/app/sitemap.ts` | 加 `${site.url}/gongyi`（保持只列中文的现有约定） |
| `deploy.sh` | 验证列表加 `/gongyi/` |
| `.gitignore` | 加 `.dev.vars`（本地测试用的 Telegram 凭据不能进仓库；现有 `.env*` 规则不覆盖它） |

不改：`next.config.ts`、`src/styles/*`、`src/app/layout.tsx`、现有页面与视图。

## 一次性配置（需要你操作）

1. **Telegram**：找 `@BotFather` 建 bot 拿 token；把 bot 加进一个群或直接私聊它，再用 `https://api.telegram.org/bot<token>/getUpdates` 取 `chat_id`；确认能收到 `sendMessage`。
2. **KV**：Cloudflare 控制台建一个 KV namespace（如 `GONGYI_RL`）。
3. **绑定**：Pages 项目 `0xff-blog` → Settings → Functions → KV namespace bindings，绑为 `GONGYI_KV`（Production 与 Preview 都绑）。
4. **密钥**：同一页 → Variables and Secrets 加 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`（都设为 Secret）。
5. **确认 Fail open**：Settings → Runtime → Fail open / closed 选 **Fail open**，Function 出问题或额度用尽时静态站照常可访问。

## 坏状态

- `GONGYI_KV` 未绑定或读写失败：跳过限流与去重，照常推送 Telegram，仍返回 200（降级放行；宁可收到，也不要丢线索）。
- `TELEGRAM_*` 未配置或推送失败：返回 502，前端提示重试；不静默丢申请，也不把邮箱明文落盘当补偿队列。
- 访客 JS 未加载：表单不可用，页面文字仍静态可读。
- 蜜罐命中 / 停留 <3 秒 / 重复邮箱：一律 200 且不推送，不给刷子任何反馈。
- `out/_routes.json` 缺失：Function 会覆盖全部路径，静态请求也计入 Function 额度；构建脚本必须保证生成，部署后用 `wrangler pages deployment tail` 抽查静态路径不触发 Function。
- Umami 未加载：埋点静默跳过，不影响申请。

## 怎么知道做对了

自动：

- `npx tsc --noEmit` 零错误。
- `npm test`：新增 `tests/apply.test.mjs` 覆盖邮箱校验（合法 / 非法 / 超长 / 含换行）、蜜罐与停留判定、归因归一化（UTM 优先级、referrer 兜底、字符白名单、64 截断）、限流判定（第 3 次通过、第 4 次拦住）、Telegram 文案拼装；`tests/i18n.test.mjs` 覆盖新字典键对齐。
- `npm run build` 成功，且 `out/gongyi/index.html`、`out/en/gongyi/index.html`、`out/_routes.json`（内容含 `"/api/*"`）都在。

对抗测试（按「本地联调」起服务，curl 需带 `Origin` 头）：

- 正常提交 → 200 且 Telegram 收到一条，消息含 `来源`。
- 蜜罐填值 → 200 且 Telegram 无新消息。
- 停留 <3 秒 → 同上。
- 同 IP 连发 4 次 → 第 4 次 429。
- 同邮箱重复提交 → 200，Telegram 只收到一次。
- 非法邮箱 → 400；GET → 405；跨站 `Origin` → 403；body >1KB → 400。
- 不绑 KV 启动 → 仍 200 且 Telegram 收到（降级）。

生产：

- `bash deploy.sh` 后 `/gongyi/` 返回 200。
- 在 `/gongyi/?utm_source=test&utm_campaign=smoke` 提交一次，Telegram 消息里 `来源: test:smoke`。
- Umami 后台能看到 `gongyi_apply_success`，且带 source。

人工：

- 微信里打开 `404-found.uk/gongyi/` 的分享链接：页面正常渲染，页面上搜不到 `wb.404-found.uk`。
- 导航出现「公益接口」，中英切换后停在 `/en/gongyi/`；深浅主题与 ≤760px 移动端布局正常。
- 表单在手机上可填可提交，成功后状态文案正确。

## 已知项与风险

- 顶栏「控制台」（`site.apps`）本来就指向 `https://wb.404-found.uk/`，站内每一页都有。本次不新增也不移除，作为已知暴露项记录。
- 公开页面必然招爬虫与白嫖；蜜罐 + 时序 + IP 限流只是放缓，**真正的闸门是你手动发码**。
- 福利不落数字（只写「邀请后可见」），降低被举报与攀比的风险。
- 需要下线时：`git revert` 对应提交 + `bash deploy.sh`，一条命令恢复。
- `content/tools.md` 与 `content/en/tools.md` 已无引用（工具数据早已搬进 `src/lib/tools.ts`），本轮不动，仅作为顺手的清理候选记录在此。
