import { CopyButton } from "@/components/site/CopyButton";
import { Eyebrow } from "@/components/site/Editorial";
import { useLang } from "@/i18n/LanguageProvider";

type PromptContent = {
  title: string;
  description: string;
  text: string;
};

const prompts: { ar: PromptContent; en: PromptContent }[] = [
  {
    ar: {
      title: "الأمر التوجيهي الرئيسي لتوليد مستندات المجلس",
      description:
        "يُستخدم لإعداد المستندات والعروض والجداول والملفات الرسمية مع الالتزام الكامل بهوية المجلس.",
      text: `الدور
أنت مصمم مستندات محترف ثنائي اللغة (العربية والإنجليزية)، وتُعد مخرجًا رسميًا لمجلس أسرة آل بوعبيد في المملكة العربية السعودية. يجب أن تتبع نظام الهوية البصرية لمجلس أسرة آل بوعبيد الوارد أدناه بوصفه المرجع التصميمي الرسمي الوحيد.

المهمة
أنشئ المخرج الآتي كاملًا وجاهزًا للاستخدام:
- نوع المستند أو المادة: [نوع المستند]
- العنوان: [عنوان المستند]
- الغرض: [الغرض]
- الجمهور المستهدف: [الجمهور المستهدف]
- اللغة: [اللغة] (العربية الفصحى / الإنجليزية / ثنائي اللغة)
- المحتوى المطلوب: [المحتوى]
- صيغة الإخراج: [صيغة الإخراج] (وورد / إكسل / عرض تقديمي / ملف PDF)
- مقاس الصفحة: [مقاس الصفحة] (الافتراضي: A4)
- متطلبات إضافية: [المتطلبات الإضافية]

المواد المصدرية
تعامل مع نظام الهوية البصرية لمجلس أسرة آل بوعبيد (هذا الدليل، أو الملخص التالي عند عدم إرفاقه) بوصفه المرجع التصميمي الملزم. لا تستحدث معايير غير موثقة فيه. إذا غابت مواصفة لازمة، فاكتب صراحةً: «غير محدد في المواد المرجعية» بدلًا من اختلاق قيمة.

ملخص الهوية البصرية المكتفي بذاته
الألوان المعتمدة وأدوارها:
- الطيني #774932: البني الغالب؛ للنصوص الأساسية والثانوية والأسطح الداكنة.
- الطيني المتوسط #8B5638: بني متوسط مساند.
- النحاسي #BA734A: لون إبراز ثانوي.
- الكريمي #FFE9D4: للخلفيات الكريمية والنص فوق الأسطح الداكنة.
- الأخضر #245B3F: للإجراءات الأساسية والروابط والعناوين الرئيسية.
- الرمادي المزرق الفاتح #E4EAEF: خلفية محايدة باردة.
- الذهبي #ECA654: لأزرار وحدود وعناصر الإبراز.

الأدوار الدلالية:
خلفية الصفحة #FFF4E9، السطح المرتفع #FFFFFF، النص الأساسي #1B110B، الرابط #245B3F، الحد الافتراضي #D0BBA9، حد الإبراز #ECA654، خلفية الإجراء الأساسي #245B3F ونصه #FFE9D4، خلفية إجراء الإبراز #ECA654 ونصه #1B110B.

الطباعة:
خط HT Baybars Display هو العائلة الخطية الوحيدة المعتمدة للعربية واللاتينية، وللعناوين والمتن، بأوزان 400 عادي و800 عريض و900 عريض جدًا. لا تستبدله بخط آخر. إذا لم يكن مثبتًا، ثبّت ملفات الخط المرخصة أو ضمّنها، وسجّل أي تعذر بوصفه انحرافًا. حجم المتن نحو 13.5 نقطة وتباعد الأسطر نحو 1.9. العنوان الأول نحو 34 نقطة عريض جدًا بالأخضر، والثاني نحو 26 نقطة عريض بالطيني، والثالث نحو 20 نقطة عريض بالنحاسي.

الشعار:
استخدم الشعار العربي الرسمي «مجلس أسرة آل بوعبيد». استخدم النسخة الداكنة على الخلفيات الفاتحة، والنسخة الفاتحة على الخلفيات الداكنة. لا تعِد رسم الشعار، ولا تمدده أو تديره أو تضف إليه مؤثرات، ولا تستخدم لونًا خارج نسخه المعتمدة.

التخطيط واللغة
- استخدم مقاس A4 ما لم يُطلب غيره، وهوامش تقارب 2.54 سم.
- في العربية: طبّق اتجاه اليمين إلى اليسار والمحاذاة اليمنى على كل فقرة وعنوان وقائمة وجدول، واعكس ترتيب أعمدة الجداول بصريًا، واستخدم علامات الترقيم العربية وتباعد أسطر مريحًا.
- أبقِ الكلمات والأرقام والبريد والروابط اللاتينية من اليسار إلى اليمين داخل السياق العربي.
- في المخرجات الثنائية، حافظ على البنية والتسلسل الهرمي والألوان نفسها في النسختين دون إعادة تصميم.

الجداول والصور والترويسات والتذييلات
- استخدم نمطًا موحدًا للجداول: رأس أخضر #245B3F ونص كريمي #FFE9D4 وحدود #D0BBA9، مع إمكان استخدام صفوف فاتحة متناوبة.
- اجعل الصور والجداول عناصر حقيقية قابلة للتحرير متى سمحت الصيغة، لا لقطات مسطحة، إلا إذا كان المطلوب إخراجًا مسطحًا للطباعة أو النشر.
- استخدم شعارًا صغيرًا أو اسم المستند في الترويسة، ورقم الصفحة واسم المجلس عند الحاجة في التذييل.

محظورات
لا تستحدث ألوانًا أو خطوطًا، ولا تغيّر الشعار أو تعيد رسمه، ولا تعِد تصميم الهوية، ولا تضف زخارف عشوائية، ولا تستخدم قوالب مؤسسية عامة، ولا تدخل علامة غير معتمدة، ولا تستبدل العربية الفصحى بلهجة عامية دون طلب، ولا تغيّر محتوى المصدر دون إذن، ولا تختلق بيانات أو أسماء أو أرقامًا، ولا تتجاهل متطلبات الاتجاه من اليمين إلى اليسار.

ضبط الجودة قبل التسليم
تحقق من الاتجاه والمحاذاة، وملاءمة نسخة الشعار للخلفية، وصحة الألوان والخطوط، واتجاه الجداول وحدودها، واتساق الترويسات والتذييلات، وصحة أرقام الصفحات، وعدم اقتصاص النص أو تجاوز الجداول، وعدم وجود صفحات فارغة غير مقصودة أو نصوص نائبة، وتمييز كل قيمة تشغيلية مستحدثة بوضوح عن معايير المجلس الرسمية.

المخرجات المطلوبة
1. المستند أو المادة المطلوبة.
2. قائمة تحقق موجزة تؤكد تطبيق نظام الهوية.
3. قائمة بالمعلومات المصدرية الناقصة موسومة بعبارة «غير محدد».
4. قائمة بأي انحراف لا يمكن تجنبه وسببه.
5. تأكيد صريح بعدم استحداث ألوان أو خطوط أو معالجات للشعار خارج النظام.

لا تكتب مقدمة مطولة؛ أنشئ المخرج أولًا، ثم أرفق البنود الخمسة أعلاه.`,
    },
    en: {
      title: "Master Prompt for Council Document Generation",
      description:
        "Use this for official documents, presentations, spreadsheets and PDFs that must follow the Council identity.",
      text: `ROLE
You are a professional bilingual (Arabic/English) document designer producing an official deliverable for the Al Bu Obaid Family Council (مجلس أسرة آل بوعبيد), a Saudi-based family council. Follow the Al Bu Obaid Family Council Visual Identity System below as the single authoritative design reference.

TASK
Produce the following as a complete, ready-to-use deliverable:
- Document/collateral type: [DOCUMENT TYPE]
- Title: [DOCUMENT TITLE]
- Purpose: [PURPOSE]
- Target audience: [TARGET AUDIENCE]
- Language: [LANGUAGE] (Arabic MSA / English / bilingual)
- Content to include: [CONTENT]
- Output format: [OUTPUT FORMAT] (docx / xlsx / pptx / pdf)
- Page size: [PAGE SIZE] (default: A4)
- Additional requirements: [ADDITIONAL REQUIREMENTS]

SOURCE MATERIAL
Treat the Al Bu Obaid Family Council Visual Identity System (this document, or the summary below if it is not attached) as the authoritative design reference. Do not invent brand standards not supported by it. If a required specification is missing, say “Not specified in the reference materials” rather than inventing a value.

VISUAL IDENTITY — SELF-CONTAINED SUMMARY
Approved colours and roles:
- Clay #774932: dominant brown; primary/secondary text and dark surfaces.
- Clay Mid #8B5638: supporting mid brown.
- Copper #BA734A: secondary accent.
- Parchment #FFE9D4: cream background and text on dark surfaces.
- Palm #245B3F: primary actions, links and H1 headings.
- Mist #E4EAEF: cool neutral background.
- Gold #ECA654: accent buttons, borders and highlights.

Semantic roles: page #FFF4E9; raised surface #FFFFFF; primary text #1B110B; link #245B3F; default border #D0BBA9; accent border #ECA654; primary action #245B3F with #FFE9D4 text; accent action #ECA654 with #1B110B text.

Typography: HT Baybars Display is the ONLY approved family for Arabic and Latin, headings and body, in 400 Regular, 800 Bold and 900 ExtraBold. Do not substitute it. Install/embed the licensed files if unavailable and flag any deviation. Body is about 13.5pt with 1.9 line-height; H1 about 34pt ExtraBold in Palm; H2 about 26pt Bold in Clay; H3 about 20pt Bold in Copper.

Logo: use the official Arabic wordmark “مجلس أسرة آل بوعبيد”. Use a dark variant on light backgrounds and a light variant on dark backgrounds. Never redraw, stretch, rotate, add effects to, or recolour it outside approved variants.

LAYOUT & LANGUAGE
- Use A4 unless told otherwise, with margins around 1 inch / 2.54cm.
- Arabic must be RTL and right-aligned throughout. Visually flip tables so the first logical column is on the right. Use Arabic punctuation and generous line-height.
- Keep Latin words, numbers, emails and URLs LTR within Arabic flow.
- For bilingual output, mirror structure, hierarchy and colours; do not redesign between languages.

TABLES, IMAGES, HEADERS & FOOTERS
- Use one table style: Palm #245B3F header, Parchment #FFE9D4 text, #D0BBA9 borders, and optional alternating light rows.
- Keep images and tables native and editable where the format permits, not flattened screenshots, unless a flattened output is requested.
- Use a small logo and/or document name in the header; page number and Council name where relevant in the footer.

NEVER
Invent colours or fonts; change or redraw the logo; redesign the identity; add random decoration; use generic corporate templates; introduce unapproved branding; replace MSA with colloquial Arabic unless requested; change source content without permission; fabricate data, names or figures; or ignore RTL requirements.

QUALITY CONTROL BEFORE DELIVERY
Check RTL and alignment; logo variant; colours and fonts; table direction and borders; consistent headers/footers; page numbers; clipped text or overflowing tables; unintended blank pages; leftover placeholders; and clear labelling of operational assumptions versus official standards.

OUTPUT REQUIRED
1. The requested document/collateral.
2. A short identity-compliance checklist.
3. Missing source information marked “Not specified”.
4. Any unavoidable deviations and their reasons.
5. Explicit confirmation that no colours, fonts or logo treatments were invented.

Do not produce a lengthy preamble. Generate the deliverable first, then report the five items above.`,
    },
  },
  {
    ar: {
      title: "أمر توليد ملف جاهز للطباعة",
      description: "يُستخدم لإعداد بطاقة أو ترويسة أو شهادة أو مادة أخرى جاهزة للإنتاج الطباعي.",
      text: `باستخدام نظام الهوية البصرية لمجلس أسرة آل بوعبيد بوصفه المرجع التصميمي الوحيد، أنشئ ملفًا جاهزًا للطباعة من نوع:
[نوع المادة، مثل: بطاقة عمل / ترويسة / شهادة].

المتطلبات:
- استخدم المقاس النهائي والسماح للقص المحددين في جدول إنتاج الطباعة في القسم 27 من نظام الهوية، أو اطلبهما إذا لم يكونا مدرجين.
- استخدم نظام الألوان الطباعي CMYK والتحويلات التقريبية المبينة لكل لون، مع توضيح أنها قيم مشتقة وليست قيمًا مصدرية.
- استخدم الشعار المتجهي بصيغة SVG دائمًا، ولا تستخدم صورة PNG النقطية في أي مخرج مطبوع.
- ضمّن الخطوط أو حوّل النصوص كلها إلى مسارات قبل التصدير، لأن خط HT Baybars Display خط تجاري مرخص.
- أبقِ النصوص المهمة والشعار داخل المساحة الآمنة وبعيدًا عن حافة القص.
- صدّر ملف PDF عالي الدقة والجودة للطباعة، وبمعيار PDF/X-1a إذا كانت الأداة تدعمه.
- لا تغيّر الشعار أو ألوان الهوية أو الطباعة أو نسب التخطيط.

أعِد: الملف الجاهز للطباعة، وملاحظة من سطر واحد تبين المقاس النهائي والسماح للقص المستخدمين، وتنبيهًا إلى أي معلومة غير محددة في نظام الهوية اضطررت إلى افتراضها.`,
    },
    en: {
      title: "Print-ready Generation Prompt",
      description:
        "Use this for a business card, letterhead, certificate or other item intended for professional printing.",
      text: `Using the Al Bu Obaid Family Council Visual Identity System as the sole design reference, produce a print-ready file for:
[COLLATERAL TYPE, e.g. business card / letterhead / certificate].

Requirements:
- Finished size and bleed as specified in the identity system’s print production table (Section 27), or ask if not listed.
- CMYK colour mode using the approximate CMYK conversions given for each brand colour; note that these are derived, not source values.
- Use the vector SVG logo, never the raster PNG, for any print output.
- Embed fonts or outline all text before export, since HT Baybars Display is a licensed commercial font.
- Keep all critical text and the logo inside the safe area, clear of the bleed/trim edge.
- Export as a high-resolution, print-quality PDF (PDF/X-1a where the tool supports it).
- Do not alter the logo, brand colours, typography or layout proportions.

Return: the print-ready file, a one-line note of the finished size and bleed used, and a flag for anything not specified in the identity system that you had to assume.`,
    },
  },
];

export function AiDocumentPrompts() {
  const { lang } = useLang();
  const rtl = lang === "ar";
  const title = rtl
    ? "مقترحات أوامر الذكاء الاصطناعي لإنشاء مستندات مجلس أسرة آل بوعبيد"
    : "Suggested AI Prompts to Generate Al Bu Obaid Family Council Documents";

  return (
    <section className="reveal-on-scroll mt-16">
      <Eyebrow rule>{title}</Eyebrow>
      <div className="measure mt-4 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
        <p>
          {rtl
            ? "اختر الأمر المناسب، واستبدل النصوص بين المعقوفين بمعلومات المستند، ثم انسخ الأمر كاملًا إلى أداة الذكاء الاصطناعي. أرفق دليل الهوية وملفات الشعار والخط والمحتوى المصدر متى أمكن."
            : "Choose the appropriate prompt, replace bracketed placeholders with your document details, then copy the complete prompt into your AI tool. Attach the identity guide, logo, font files and source content whenever possible."}
        </p>
        <p>
          {rtl
            ? "راجع المخرج قبل اعتماده، ولا تُدخل بيانات شخصية أو سرية في أداة غير معتمدة من المجلس."
            : "Review every output before approval, and do not enter personal or confidential information into a tool not approved by the Council."}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {prompts.map((prompt, index) => {
          const content = rtl ? prompt.ar : prompt.en;
          return (
            <article key={content.title} className="rounded-md border border-border bg-card p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="nums font-mono text-[11px] text-muted-foreground">
                    {rtl ? `الأمر ${index + 1}` : `Prompt ${index + 1}`}
                  </p>
                  <h3 className="mt-2 text-[16px] font-semibold leading-snug text-foreground">
                    {content.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {content.description}
                  </p>
                </div>
                <CopyButton
                  value={content.text}
                  label={rtl ? "نسخ الأمر كاملًا" : "Copy full prompt"}
                  className="shrink-0 self-start"
                />
              </div>
              <pre
                dir={rtl ? "rtl" : "ltr"}
                className="mt-5 max-h-[34rem] overflow-auto whitespace-pre-wrap break-words rounded-sm border border-border bg-muted/30 p-4 font-sans text-[13px] leading-loose text-foreground"
              >
                {content.text}
              </pre>
            </article>
          );
        })}
      </div>
    </section>
  );
}