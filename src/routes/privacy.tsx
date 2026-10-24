import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية وحماية البيانات الشخصية | آل بوعبيد" },
      {
        name: "description",
        content:
          "كيف يجمع موقع أسرة آل بوعبيد البيانات الشخصية ويستخدمها ويحفظها ويشاركها ويحذفها، وحقوقك بموجب نظام حماية البيانات الشخصية السعودي.",
      },
      { property: "og:title", content: "سياسة الخصوصية وحماية البيانات الشخصية — آل بوعبيد" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/privacy") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/privacy") }],
  }),
  component: () => <LegalDocumentPage doc="privacy" />,
});
