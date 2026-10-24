import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية وشروط الاستخدام | آل بوعبيد" },
      {
        name: "description",
        content:
          "الشروط والأحكام وإخلاء المسؤولية وإشعار الخصوصية وحقوق المحتوى لموقع أسرة آل بوعبيد، وفق الأنظمة المعمول بها في المملكة العربية السعودية.",
      },
      { property: "og:title", content: "سياسة الخصوصية وشروط الاستخدام — آل بوعبيد" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/terms") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/terms") }],
  }),
  component: () => <LegalDocumentPage doc="terms" />,
});
