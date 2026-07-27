/**
 * 全站配置 —— 把这里改成你自己的信息即可。
 * 这是唯一需要修改的"配置文件"，页面文案大多从这里读取。
 */
export const site = {
  /** 站点名，显示在左上角导航与标题里 */
  name: "阿九",
  /** 浏览器标签页标题 */
  title: "阿九 · 个人站",
  /** 站点描述，用于 SEO 与 RSS */
  description: "测试工程师，记录生活与学习中的所思所想。",
  /** 线上域名(部署后替换，用于 sitemap / RSS / 分享链接) */
  url: "https://example.com",

  /** 首页 Hero */
  hero: {
    greeting: "我是阿九。",
    bio: "测试工程师，方向是测试研发。完美主义者，偏爱极简的界面与干净的文字。这里是我的数字自留地，记录生活，分享学习。",
  },

  /** 社交与联系方式(留空字符串则不显示) */
  links: {
    github: "https://github.com/ZeniX-ally",
    email: "",
    rss: "/feed.xml",
  },
} as const;

export type Site = typeof site;
