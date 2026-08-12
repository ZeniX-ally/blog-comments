/**
 * 命令彩蛋:纯逻辑,CommandLine 组件调用。
 * clear 返回 { output: [], clear: true } 由组件清空屏幕。
 * lang 决定提示文案的语言。
 */
export type CommandResult = { output: string[]; clear?: boolean };

const TEXTS = {
  zh: {
    help: [
      "可用命令:",
      "  help     — 显示本帮助",
      "  whoami   — 我是谁",
      "  ls       — 浏览站点目录",
      "  date     — 北京时间",
      "  clear    — 清屏",
      "  0xff     — 站点主题彩蛋",
      "  ajiu     — 关于我",
    ],
    whoami: "阿九 — 测试工程师,折腾派,夜猫子。",
    ls: ["posts/  projects/  tools/  about/  tags/"],
    date: " (北京时间)",
    "0xff": ["0xFF = 255", "256 个状态的最后一位", "这个站的底色。"],
    ajiu: ["阿九 — 沧海余一粟,折中取九分。", "写博客,写工具,写生活。"],
    notfound: (n: string) => `command not found: ${n} — 输入 help 查看可用命令`,
  },
  en: {
    help: [
      "available commands:",
      "  help     — show this help",
      "  whoami   — who am i",
      "  ls       — browse site directory",
      "  date     — Beijing time",
      "  clear    — clear screen",
      "  0xff     — site theme easter egg",
      "  ajiu     — about me",
    ],
    whoami: "Ajiu — test engineer, tinkerer, night owl.",
    ls: ["posts/  projects/  tools/  about/  tags/"],
    date: " (Beijing time)",
    "0xff": ["0xFF = 255", "the last of 256 states", "the base color of this site."],
    ajiu: ["Ajiu — one drop in the sea, taking the nine-tenths middle.", "Blogs, tools, life."],
    notfound: (n: string) => `command not found: ${n} — type help for available commands`,
  },
} as const;

export function runCommand(input: string, lang: "zh" | "en" = "zh"): CommandResult {
  const [name] = input.trim().split(/\s+/);
  const t = TEXTS[lang];

  switch (name) {
    case "help":
      return { output: [...t.help] };
    case "whoami":
      return { output: [t.whoami] };
    case "ls":
      return { output: [...t.ls] };
    case "date":
      return {
        output: [
          new Date().toLocaleString(lang === "zh" ? "zh-CN" : "en-GB", {
            timeZone: "Asia/Shanghai",
            hour12: false,
          }) + t.date,
        ],
      };
    case "clear":
      return { output: [], clear: true };
    case "0xff":
      return { output: [...t["0xff"]] };
    case "ajiu":
      return { output: [...t.ajiu] };
    case "":
      return { output: [] };
    default:
      return { output: [t.notfound(name)] };
  }
}
