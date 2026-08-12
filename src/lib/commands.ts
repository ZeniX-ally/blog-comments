/**
 * 命令彩蛋:纯逻辑,CommandLine 组件调用。
 * clear 返回 { output: [], clear: true } 由组件清空屏幕。
 */
export type CommandResult = { output: string[]; clear?: boolean };

export function runCommand(input: string): CommandResult {
  const [name] = input.trim().split(/\s+/);

  switch (name) {
    case "help":
      return {
        output: [
          "可用命令:",
          "  help     — 显示本帮助",
          "  whoami   — 我是谁",
          "  ls       — 浏览站点目录",
          "  date     — 北京时间",
          "  clear    — 清屏",
          "  0xff     — 站点主题彩蛋",
          "  ajiu     — 关于我",
        ],
      };
    case "whoami":
      return { output: ["阿九 — 测试工程师,折腾派,夜猫子。"] };
    case "ls":
      return {
        output: ["posts/  projects/  tools/  about/  tags/"],
      };
    case "date":
      return {
        output: [
          new Date().toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour12: false,
          }) + " (北京时间)",
        ],
      };
    case "clear":
      return { output: [], clear: true };
    case "0xff":
      return {
        output: ["0xFF = 255", "256 个状态的最后一位", "这个站的底色。"],
      };
    case "ajiu":
      return {
        output: [
          "阿九 — 沧海余一粟,折中取九分。",
          "写博客,写工具,写生活。",
        ],
      };
    case "":
      return { output: [] };
    default:
      return {
        output: [`command not found: ${name} — 输入 help 查看可用命令`],
      };
  }
}
