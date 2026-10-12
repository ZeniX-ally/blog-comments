import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/seo";
import { getGongyiContent } from "@/lib/gongyi-content";
import { PageTransition } from "@/components/page-transition";
import { GongyiView } from "@/views/gongyi";

const title = "Free API";
const description =
  "An invite-only free AI API: what it is, how to use it, where its limits are, and how to request an invite.";
const canonical = canonicalUrl("/en/gongyi");

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical,
  },
  openGraph: {
    title,
    description,
    url: canonical,
    type: "website",
    locale: "en_US",
    images: ["/og/default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og/default.png"],
  },
};

export default async function GongyiPageEn() {
  const content = await getGongyiContent("en");
  return (
    <PageTransition>
      <GongyiView lang="en" content={content} />
    </PageTransition>
  );
}
