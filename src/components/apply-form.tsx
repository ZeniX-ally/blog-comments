"use client";

import { dict, type Lang } from "@/lib/i18n";

/** 占位：Task 6 替换为真实表单 */
export function ApplyForm({ lang }: { lang: Lang }) {
  return <p className="label">{dict[lang].gongyi.form.label}</p>;
}
