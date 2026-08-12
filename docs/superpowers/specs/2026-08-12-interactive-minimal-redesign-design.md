# 全站改版:更强交互 + 更简约(终端风去装饰)

日期:2026-08-12
状态:已批准,实施中

## 目标

全站(首页/文章/工具/作品/关于/标签)统一改版:
- **交互更强**:鼠标实时反馈 + 终端沉浸感 + 内容动效,三者全要
- **视觉更简约**:保留终端/0xff 人格,去掉边框、装饰线、冗余标签,加大留白
- **功能全保留**:搜索、阅读进度、回到顶部、主题切换、Giscus 评论、GitHub 登录、Umami 统计

## 方案:A. 统一交互层

不引第三方库。一个全局 `EffectLayer` + 两个 hook 管全部动效,CSS 变量统一驱动。

### 新增文件

| 文件 | 职责 |
|---|---|
| `src/components/effect-layer.tsx` | 全局光标光晕 + 音效播放器(WebAudio 合成敲键/回车声,默认关) |
| `src/hooks/use-in-view.ts` | IntersectionObserver 单实例,驱动滚动入场(渐显+方向)与逐行浮现 |
| `src/hooks/use-typewriter.ts` | 打字机 hook(点击跳过、reduced-motion 直显全文) |
| `src/components/spotlight.tsx` | 局部照亮(mousemove 光斑跟随,复用 TiltCard 光斑逻辑) |
| `src/components/command-line.tsx` | 命令彩蛋输入行 |
| `src/lib/commands.ts` | 命令表与执行逻辑(help/whoami/ls/date/clear/0xff/ajiu) |

### 交互落地

| 交互 | 落点 | 实现 |
|---|---|---|
| 打字机+闪烁光标 | 首页 hero 标题、关于页开头 | useTypewriter + 光标 CSS 动画 |
| 全局光晕 | 全站 body | EffectLayer 内 div,鼠标位置驱动 CSS 变量,rAF 节流 |
| 元素微动 | 链接/按钮 hover 轻移+发光 | 统一 `.interactive` 类 + CSS transition |
| 局部照亮 | 文章列表行、工具卡、作品卡 | Spotlight 组件 |
| 滚动渐显加强 | 全站区块(up/fade/scale 方向) | useInView + `.reveal` 类 |
| 文字逐行浮现 | 区块内段落/列表项 stagger 依次浮现 | useInView 返回 index 交错 delay |
| 章节联动 | 文章页标题滚动高亮 + 阅读进度条增强 | 增强 reading-progress,标题进入视口时高亮 |
| 命令彩蛋 | 首页底部输入行 | CommandLine + commands.ts |
| 音效(默认关) | 打字机敲键、命令回车 | WebAudio 振荡器合成,需用户手势解锁 |

### 简约视觉

- **删**:卡片边框、扫描线装饰、投影、背景色块
- **弱化**:hex 编号 `[0xNN]` 字号透明度降、LED 灯只留 header/footer 各 1 颗
- **留白**:区块间距加倍、卡片 padding 加大、正文行高放宽
- **保持**:mono 字体、0xff 配色、暗色主题、终端人格

### 性能与无障碍

- 鼠标事件 rAF 节流;IntersectionObserver 单实例复用
- `prefers-reduced-motion` 全部降级为纯淡入,不静默跳过
- 触屏禁用光晕(pointer: coarse 检测)
- 音效默认关,需用户手势(AudioContext 用户激活)解锁

## 改动文件

新增 6,改动 ~12:layout/globals.css/page/各页卡片/post-list/fade-in/md-page/nav-link/back-button/back-to-top/reading-progress/site-header/footer。

## 构建

`npm run build`(next build && generate-feed && generate-og)需在 ext4 盘 blog-build 构建验证,NTFS 盘只做源码修改。
