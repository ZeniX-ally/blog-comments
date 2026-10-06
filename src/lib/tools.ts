/**
 * 工具页数据(zh / en 各一份)。
 * 从 app/tools/page.tsx 与 app/en/tools/page.tsx 原样搬出:页面文件只能导出
 * default / metadata 等约定字段,数据与类型放这里供首页计数和工具页共用。
 */
import type { Lang } from "@/lib/i18n";

export type ToolStatus = "RUNNING" | "LOCAL" | "LAB" | "DAILY";

export interface Tool {
  name: string;
  desc: string;
  status: ToolStatus;
  tag: string;
}

export interface ToolSection {
  title: string;
  en: string;
  tools: Tool[];
}

export const TOOL_SECTIONS: Record<Lang, ToolSection[]> = {
  zh: [
    {
      title: "自建服务",
      en: "Self-hosted",
      tools: [
        { name: "Jellyfin", desc: "家庭媒体中心 · 影视管理", status: "RUNNING", tag: "iStoreOS" },
        { name: "Qdrant", desc: "知识库向量存储 · 记忆中枢", status: "RUNNING", tag: "Docker" },
        { name: "OpenClash", desc: "代理 · 家里的网络出口", status: "RUNNING", tag: "iStoreOS" },
        { name: "Vaultwarden", desc: "密码管理 · 替代 LastPass", status: "RUNNING", tag: "Docker" },
        { name: "Radarr · Sonarr · Bazarr", desc: "影音自动化下载管理", status: "RUNNING", tag: "ARR-Stack" },
        { name: "Prowlarr · qBittorrent", desc: "索引 + 下载引擎", status: "RUNNING", tag: "ARR-Stack" },
        { name: "Speedtest-tracker", desc: "网速历史记录", status: "RUNNING", tag: "Docker" },
      ],
    },
    {
      title: "开发与工具",
      en: "Dev tools",
      tools: [
        { name: "VS Code", desc: "主力编辑器 · 深色主题", status: "LOCAL", tag: "editor" },
        { name: "OpenCode", desc: "vibe coding 主力 · AI 辅助写码", status: "LOCAL", tag: "agent" },
        { name: "git", desc: "代码版本管理", status: "LOCAL", tag: "vcs" },
        { name: "Python 3.x", desc: "脚本与自动化", status: "LOCAL", tag: "lang" },
      ],
    },
    {
      title: "测试相关",
      en: "Test lab",
      tools: [
        { name: "FCT / IGBT 测试", desc: "工作主战场 · 产线测试", status: "LAB", tag: "flex" },
        { name: "XCP 协议", desc: "ECU 标定与测量", status: "LAB", tag: "protocol" },
        { name: "上位机", desc: "与产线设备交互", status: "LAB", tag: "host-app" },
      ],
    },
    {
      title: "生活向",
      en: "Daily",
      tools: [
        { name: "foobar2000", desc: "本地音乐播放", status: "DAILY", tag: "audio" },
        { name: "小米电视 + ADB", desc: "折腾电视装应用", status: "DAILY", tag: "tv" },
      ],
    },
  ],
  en: [
    {
      title: "自建服务",
      en: "Self-hosted",
      tools: [
        { name: "Jellyfin", desc: "Home media center", status: "RUNNING", tag: "iStoreOS" },
        { name: "Qdrant", desc: "Vector store for knowledge base", status: "RUNNING", tag: "Docker" },
        { name: "OpenClash", desc: "Proxy · home network exit", status: "RUNNING", tag: "iStoreOS" },
        { name: "Vaultwarden", desc: "Password manager", status: "RUNNING", tag: "Docker" },
        { name: "Radarr · Sonarr · Bazarr", desc: "Media automation downloads", status: "RUNNING", tag: "ARR-Stack" },
        { name: "Prowlarr · qBittorrent", desc: "Indexer + download engine", status: "RUNNING", tag: "ARR-Stack" },
        { name: "Speedtest-tracker", desc: "Speed history records", status: "RUNNING", tag: "Docker" },
      ],
    },
    {
      title: "开发与工具",
      en: "Dev tools",
      tools: [
        { name: "VS Code", desc: "Main editor · dark theme", status: "LOCAL", tag: "editor" },
        { name: "OpenCode", desc: "Vibe coding · AI-assisted", status: "LOCAL", tag: "agent" },
        { name: "git", desc: "Version control", status: "LOCAL", tag: "vcs" },
        { name: "Python 3.x", desc: "Scripting and automation", status: "LOCAL", tag: "lang" },
      ],
    },
    {
      title: "测试相关",
      en: "Test lab",
      tools: [
        { name: "FCT / IGBT Testing", desc: "Main battlefield · line testing", status: "LAB", tag: "flex" },
        { name: "XCP Protocol", desc: "ECU calibration & measurement", status: "LAB", tag: "protocol" },
        { name: "Host-PC Apps", desc: "Interacting with line equipment", status: "LAB", tag: "host-app" },
      ],
    },
    {
      title: "生活向",
      en: "Daily",
      tools: [
        { name: "foobar2000", desc: "Local music player", status: "DAILY", tag: "audio" },
        { name: "Xiaomi TV + ADB", desc: "Tinkering with TV apps", status: "DAILY", tag: "tv" },
      ],
    },
  ],
};

/** 某语言下工具总数(首页入口清单的计数) */
export function toolCount(lang: Lang): number {
  return TOOL_SECTIONS[lang].reduce((n, s) => n + s.tools.length, 0);
}
