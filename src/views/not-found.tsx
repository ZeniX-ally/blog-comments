import Link from "next/link";
import { Stagger } from "@/components/stagger";
import { dict, type Lang } from "@/lib/i18n";

/** 404:h1「404」120px + serif 一句话 + pill「回到首页 →」(出场编排)。静态导出只有一个 404,壳固定 lang="zh"。 */
export function NotFoundView({ lang }: { lang: Lang }) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";

  return (
    <div className="content">
      <Stagger className="not-found">
        <h1 className="reveal">{d.notFound.title}</h1>
        <p className="lede reveal">{d.notFound.text}</p>
        <Link className="pill reveal" href={`${p}/`}>
          {d.notFound.home} <span className="arrow">→</span>
        </Link>
      </Stagger>
    </div>
  );
}
