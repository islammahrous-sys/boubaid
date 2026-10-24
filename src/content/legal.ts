import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Legal documents shown on /terms and /privacy, and the version members accept
 * at sign-up. Bump LEGAL_VERSION (and LEGAL_EFFECTIVE_DATE) whenever the text
 * of either document changes materially: the acceptance stored with each
 * account records the version it was given, so an old acceptance never
 * silently vouches for new wording.
 */
export const LEGAL_VERSION = "1.0";
export const LEGAL_EFFECTIVE_DATE = "2026-10-24";

export type LegalDocumentKey = "terms" | "privacy";

export type LegalSection = {
  id: string;
  title: BiText;
  paragraphs: BiText[];
};

export const LEGAL_DOCUMENTS: Record<
  LegalDocumentKey,
  { path: "/terms" | "/privacy"; title: BiText; summary: BiText }
> = {
  terms: {
    path: "/terms",
    title: {
      ar: "سياسة الخصوصية وشروط الاستخدام",
      en: "Privacy Policy & Terms of Use",
    },
    summary: {
      ar: "الشروط والأحكام وإخلاء المسؤولية وإشعار الخصوصية وحقوق المحتوى لموقع أسرة آل بوعبيد.",
      en: "Terms and Conditions, Disclaimer, Privacy Notice and Content Rights for the Al Bu Obaid family website.",
    },
  },
  privacy: {
    path: "/privacy",
    title: {
      ar: "سياسة الخصوصية وحماية البيانات الشخصية",
      en: "Privacy Policy and Personal Data Protection",
    },
    summary: {
      ar: "كيف نجمع بياناتك الشخصية ونستخدمها ونحفظها ونشاركها ونحذفها، وحقوقك بموجب نظام حماية البيانات الشخصية.",
      en: "How we collect, use, store, share and delete your personal data, and your rights under the Personal Data Protection Law.",
    },
  },
};

/** Short notice for visitors (end of the source document). */
export const VISITOR_NOTICE: BiText = {
  ar: "يخضع استخدام هذا الموقع لشروط الاستخدام وإخلاء المسؤولية وإشعار الخصوصية. يحظر نسخ أو إعادة نشر شجرة العائلة أو الصور أو الفيديوهات أو الوثائق أو أي محتوى محمي دون إذن صاحب الحق، كما يحظر جمع البيانات الأسرية أو الشخصية أو نشرها دون مسوغ مشروع. وتُطبق الأنظمة المعمول بها في المملكة العربية السعودية.",
  en: "Use of this Website is subject to its Terms and Conditions, Disclaimer, and Privacy Notice. Copying or republishing the family tree, photographs, videos, documents, or other protected Content without the rights holder’s permission is prohibited. Collecting or disclosing family or Personal Data without lawful grounds is also prohibited. The laws and regulations in force in the Kingdom of Saudi Arabia apply.",
};

/** Article 14 — the acknowledgement a member gives when creating an account. */
export const REGISTRATION_ACKNOWLEDGEMENT: BiText = {
  ar: "أقرّ أنا المستخدم/العضو بأنني اطلعت على هذه الشروط والأحكام وإخلاء المسؤولية وإشعار الخصوصية وحقوق المحتوى، وفهمت أحكامها، وأوافق على الالتزام بها. وأتعهد باستخدام الموقع استخداماً مشروعاً، واحترام خصوصية أفراد الأسرة وحقوق الملكية الفكرية، وعدم نسخ أو نشر أو استغلال المحتوى أو شجرة العائلة خارج النطاق المسموح، وعدم رفع مواد لا أملك حق مشاركتها أو التصاريح اللازمة بشأنها.",
  en: "I acknowledge that I have read and understood these Terms and Conditions, Disclaimer, Privacy Notice, and Content Rights, and agree to comply with the provisions applicable to my use of the Website. I undertake to use the Website lawfully, respect the privacy of family members and intellectual property rights, refrain from copying, republishing, or exploiting Content or the family tree beyond the permitted scope, and refrain from uploading material that I am not entitled to share or for which I lack the necessary permissions.",
};

/** Optional, separately-given consents. Never bundled with the terms. */
export const OPTIONAL_CONSENTS = {
  marketing: {
    ar: "أوافق على تلقي النشرة الأسرية والرسائل التعريفية بالفعاليات والمبادرات عبر البريد الإلكتروني (اختياري، ويمكن سحب الموافقة في أي وقت).",
    en: "I agree to receive the family newsletter and emails about events and initiatives (optional; can be withdrawn at any time).",
  },
  media_publication: {
    ar: "أوافق على نشر صوري أو المقاطع المرئية التي أظهر فيها ضمن تغطيات المجلس وفعالياته على الموقع (اختياري، ويمكن سحب الموافقة في أي وقت).",
    en: "I agree to the publication of photos or videos in which I appear as part of council and event coverage on the Website (optional; can be withdrawn at any time).",
  },
} satisfies Record<string, BiText>;

export type OptionalConsentKey = keyof typeof OPTIONAL_CONSENTS;

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "definitions",
    title: { ar: "المادة الأولى: التعريفات والتفسير", en: "Article 1: Definitions and Interpretation" },
    paragraphs: [
      {
        ar: "لأغراض هذه الشروط والأحكام، يكون للكلمات والعبارات الآتية المعاني الموضحة أمام كل منها، ما لم يقتضِ السياق خلاف ذلك: «الموقع»: الموقع الإلكتروني www.boubaid.com وما يتبعه من صفحات وخدمات رقمية؛ «المستخدم»: كل شخص يزور الموقع أو يتصفح محتواه؛ «العضو»: كل فرد من أفراد الأسرة ينشئ حساباً أو يسجل الدخول إلى خدمة مخصصة للأعضاء؛ «المحتوى»: كل نص أو صورة أو فيديو أو تسجيل صوتي أو وثيقة أو رسم أو شعار أو مادة أرشيفية أو بيانات أو شجرة عائلة أو غير ذلك مما يُعرض أو يُتاح عبر الموقع؛ «البيانات الشخصية»: كل بيان يتعلق بشخص طبيعي محدد أو يمكن تحديد هويته بصورة مباشرة أو غير مباشرة.",
        en: "For the purposes of these Terms and Conditions, unless the context requires otherwise, the following terms shall have the meanings set out below: “Website” means www.boubaid.com and its associated pages and digital services; “User” means any person who visits or browses the Website; “Member” means a family member who creates an account or signs in to a service reserved for members; “Content” means any text, photograph, video, audio recording, document, illustration, logo, archival material, data, family tree, or other material displayed or made available through the Website; and “Personal Data” means any information relating to an identified or identifiable natural person, whether directly or indirectly.",
      },
      {
        ar: "تُفسر هذه الشروط بما يتفق مع الأنظمة المعمول بها في المملكة العربية السعودية، ولا يُفسر أي حكم فيها بما يخالف حكماً نظامياً آمراً أو ينتقص من حق لا يجوز التنازل عنه.",
        en: "These Terms shall be interpreted in accordance with the laws and regulations in force in the Kingdom of Saudi Arabia. No provision shall be interpreted in a manner that conflicts with a mandatory legal requirement or waives a right that cannot lawfully be waived.",
      },
    ],
  },
  {
    id: "scope",
    title: { ar: "المادة الثانية: نطاق التطبيق والقبول الإلكتروني", en: "Article 2: Scope and Electronic Acceptance" },
    paragraphs: [
      {
        ar: "تنظم هذه الوثيقة دخول الموقع واستخدامه، وتُطبق على الزوار والأعضاء بحسب طبيعة الخدمة المستخدمة. ويُعد استمرار التصفح قبولاً بالأحكام التي تنطبق على الاستخدام العام، أما إنشاء الحساب أو استخدام الخدمات المقيدة فيستلزم إقراراً إلكترونياً صريحاً بالموافقة على هذه الشروط وإشعار الخصوصية.",
        en: "This document governs access to and use of the Website and applies to visitors and Members according to the service being used. Continued browsing constitutes acceptance of the provisions applicable to general use. Creating an account or using restricted services requires an express electronic acknowledgement accepting these Terms and the Privacy Notice.",
      },
      {
        ar: "يقر المستخدم بأنه قرأ هذه الوثيقة وفهم مضمونها، وأن لديه الأهلية النظامية لإبرام الالتزامات الناشئة عنها. وإذا لم يوافق على أحكامها، فعليه الامتناع عن التسجيل أو التوقف عن استخدام الخدمات التي تتطلب الموافقة. ولا تُعد الموافقة العامة بديلاً عن أي موافقة مستقلة يوجبها النظام لغرض محدد.",
        en: "By using the Website, the User confirms that they have read and understood this document and have the legal capacity to assume the obligations arising from it. If the User does not agree, they must not register or must discontinue use of services requiring acceptance. General acceptance of these Terms does not replace any separate consent required by law for a specific purpose.",
      },
    ],
  },
  {
    id: "lawful-use",
    title: { ar: "المادة الثالثة: مشروعية الاستخدام والالتزامات", en: "Article 3: Lawful Use and User Obligations" },
    paragraphs: [
      {
        ar: "يلتزم المستخدم باستخدام الموقع استخداماً مشروعاً، وبما يحفظ الآداب العامة وحقوق الآخرين وخصوصيتهم وكرامتهم، وبما يتفق مع الأنظمة السعودية ذات الصلة.",
        en: "The User shall use the Website lawfully and in a manner that respects public morals, the rights of others, their privacy and dignity, and applicable Saudi laws and regulations.",
      },
      {
        ar: "يحظر على المستخدم، على وجه الخصوص: (أ) نشر أو إرسال محتوى غير مشروع أو تشهيري أو مسيء أو مضلل أو ينتهك حقوق الغير؛ (ب) انتحال شخصية الغير أو تقديم بيانات جوهرية غير صحيحة؛ (ج) محاولة الدخول إلى حسابات أو أنظمة أو بيانات دون تصريح؛ (د) تعطيل الموقع أو العبث بأمنه أو تجاوز وسائل الحماية؛ (هـ) جمع بيانات المستخدمين أو استخراجها آلياً أو إنشاء قواعد بيانات منها دون مسوغ أو إذن؛ (و) استخدام الموقع في الاحتيال أو المضايقة أو التهديد أو التمييز أو لأي غرض مخالف للنظام.",
        en: "The User shall not: (a) publish or transmit unlawful, defamatory, abusive, misleading, or rights-infringing Content; (b) impersonate another person or provide materially false information; (c) attempt to access any account, system, or data without authorization; (d) disrupt the Website, compromise its security, or circumvent protective measures; (e) collect or extract other users’ data by automated means or create databases from such data without lawful grounds or authorization; (f) use the Website for fraud, harassment, threats, or discrimination; or (g) engage in any other conduct prohibited by applicable law.",
      },
      {
        ar: "يتحمل المستخدم مسؤولية المحافظة على بيانات دخوله، وعن الأنشطة التي تتم من خلال حسابه، ما لم يثبت أن الاستخدام غير المصرح به وقع بسبب لا يُنسب إليه. ويلتزم بإبلاغ القنوات الرسمية المنشورة على الموقع عند الاشتباه في اختراق حسابه.",
        en: "The User is responsible for safeguarding their login credentials and for activities carried out through their account, unless unauthorized use is shown to have occurred for reasons not attributable to the User. The User shall notify the official contact channel published on the Website if they suspect their account has been compromised.",
      },
    ],
  },
  {
    id: "ip",
    title: { ar: "المادة الرابعة: الملكية الفكرية وحقوق المؤلف", en: "Article 4: Intellectual Property and Copyright" },
    paragraphs: [
      {
        ar: "تخضع المصنفات والمواد المنشورة عبر الموقع، بما في ذلك النصوص والصور الفوتوغرافية والمقاطع المرئية والتسجيلات الصوتية والتصاميم والشعارات والرسوم والوثائق والمخطوطات والمواد الأرشيفية وشجرة العائلة واللوحات البصرية وقواعد البيانات، للحقوق المقررة لأصحابها بموجب نظام حماية حقوق المؤلف والأنظمة ذات الصلة.",
        en: "Works and materials published through the Website—including texts, photographs, videos, audio recordings, designs, logos, illustrations, documents, manuscripts, archival materials, family trees, visual boards, and databases—are subject to the rights of their respective owners under the Saudi Copyright Law and other applicable laws.",
      },
      {
        ar: "لا يترتب على إتاحة أي محتوى عبر الموقع انتقال ملكيته إلى المستخدم أو منحه ترخيصاً ضمنياً بإعادة استخدامه. ويقتصر الاستخدام المسموح به على التصفح الشخصي المشروع ضمن الوظيفة التي أتيح المحتوى من أجلها، ما لم يُنص صراحة على ترخيص أوسع أو يصدر إذن من صاحب الحق.",
        en: "Making Content available through the Website does not transfer ownership to the User or grant an implied licence to reuse it. Unless a broader licence is expressly stated or permission is obtained from the rights holder, permitted use is limited to lawful personal browsing within the function for which the Content is made available.",
      },
      {
        ar: "يحظر نسخ المحتوى أو إعادة إنتاجه أو نشره أو توزيعه أو تعديله أو ترجمته أو عرضه للجمهور أو بيعه أو استغلاله تجارياً أو إعادة رفعه إلى منصة أخرى، كلياً أو جزئياً، دون إذن كتابي من صاحب الحق، إلا في الحدود التي يجيزها النظام.",
        en: "The User shall not copy, reproduce, republish, distribute, modify, translate, publicly display, sell, commercially exploit, or upload Content to another website or platform, in whole or in part, without the rights holder’s written permission, except to the extent permitted by law.",
      },
      {
        ar: "لا يجوز إزالة إشعارات حقوق المؤلف أو العلامات أو البيانات التي تحدد مصدر المحتوى أو صاحبه. ولا تعني إتاحة المحتوى أن جميع الحقوق فيه مملوكة لجهة واحدة؛ فعلى المستخدم التحقق من صاحب الحق والحصول على الأذونات اللازمة قبل أي استعمال خارجي.",
        en: "Copyright notices, trademarks, and information identifying the source or owner of Content must not be removed. The availability of Content does not mean that all rights are owned by one party. The User must verify the relevant rights holder and obtain any necessary permissions before using Content outside the Website.",
      },
    ],
  },
  {
    id: "user-content",
    title: { ar: "المادة الخامسة: المحتوى الذي يرفعه المستخدم", en: "Article 5: Content Submitted by Users" },
    paragraphs: [
      {
        ar: "إذا أتاح الموقع للمستخدم رفع أو إرسال صور أو مقاطع أو وثائق أو معلومات، يقر المستخدم بأنه يملك الحق في رفعها أو أنه حصل على التصاريح اللازمة، وأنها لا تنتهك حقوق المؤلف أو الخصوصية أو أي حق نظامي للغير.",
        en: "Where the Website allows a User to upload or submit photographs, videos, documents, or other information, the User represents that they own the rights necessary to submit the material or have obtained the required permissions, and that the material does not infringe copyright, privacy, or any other legal right of a third party.",
      },
      {
        ar: "يمنح المستخدم، في حدود الغرض الذي أرسل المحتوى من أجله، إذناً غير حصري باستخدامه داخل الموقع لاستلامه وحفظه وعرضه أو معالجته بما يلزم لتقديم الخدمة المطلوبة، وذلك دون نقل ملكية المحتوى أو منحه حقاً في استخدامه خارج ذلك الغرض. ويظل المستخدم مسؤولاً عن مشروعية ما يرفعه وعن صحة ما يقدمه من بيانات.",
        en: "For the purpose for which the material is submitted, the User grants permission for the material to be received, stored, displayed, or processed within the Website to the extent necessary to provide the requested service. This permission is non-exclusive and does not transfer ownership or grant a right to use the material for unrelated purposes.",
      },
      {
        ar: "يحظر رفع أو نشر صور أو تسجيلات أو مراسلات خاصة أو وثائق شخصية أو معلومات غير عامة تخص شخصاً آخر دون مسوغ مشروع وموافقة لازمة متى تطلب النظام ذلك. ولا يجوز استخدام الموقع لنشر محتوى ينطوي على انتهاك أو إساءة أو كشف غير مشروع للبيانات.",
        en: "The User must not upload or publish another person’s photographs, recordings, private correspondence, personal documents, or non-public information without lawful grounds and any consent required by law. The Website must not be used to publish material that unlawfully exposes personal information, infringes rights, or causes abuse or harm.",
      },
    ],
  },
  {
    id: "family-tree",
    title: { ar: "المادة السادسة: شجرة العائلة والمعلومات الأسرية", en: "Article 6: Family Tree and Family Information" },
    paragraphs: [
      {
        ar: "تُستخدم شجرة العائلة والمعلومات المتعلقة بالأنساب والروابط الأسرية لأغراض التوثيق والتواصل العائلي ضمن حدود الصلاحيات المتاحة لكل مستخدم. وقد تتضمن بعض هذه المعلومات بيانات شخصية، ولذلك يحظر نسخها أو استخراجها أو نشرها أو تداولها خارج النطاق المسموح أو استخدامها في بناء قواعد بيانات مستقلة أو لأغراض تجارية أو دعائية.",
        en: "The family tree, genealogical information, family relationships, and related materials are made available for family documentation and communication, subject to the access permissions applicable to each User. Some of this information may constitute Personal Data. Users must not copy, extract, circulate, or republish it outside the permitted scope, or use it to create independent databases or for commercial or promotional purposes.",
      },
      {
        ar: "لا يجوز للمستخدم محاولة الوصول إلى التفاصيل المقصورة على الأعضاء أو تجاوز القيود التقنية أو التنظيمية المفروضة على الاطلاع. ولا تُعد المعلومات التاريخية أو النسبية المعروضة بالموقع، بذاتها، وثيقة رسمية أو حجة قضائية ما لم تكن صادرة عن جهة مختصة أو موصوفة صراحة بصفة رسمية.",
        en: "Users must not attempt to access information restricted to Members or circumvent technical or other access controls. Historical or genealogical information displayed on the Website does not, by itself, constitute an official document or judicial evidence unless issued by a competent authority or expressly identified as official.",
      },
    ],
  },
  {
    id: "privacy",
    title: { ar: "المادة السابعة: حماية البيانات الشخصية والخصوصية", en: "Article 7: Personal Data Protection and Privacy" },
    paragraphs: [
      {
        ar: "تُفسر أحكام هذه المادة وتُطبق وفق نظام حماية البيانات الشخصية السعودي ولائحته التنفيذية ولائحة نقل البيانات الشخصية إلى خارج المملكة، بحسب ما ينطبق على المعالجة المعنية.",
        en: "This Article shall be interpreted and applied in accordance with the Saudi Personal Data Protection Law, its Implementing Regulations, and the Regulation on Personal Data Transfer Outside the Kingdom, to the extent applicable to the relevant processing.",
      },
      {
        ar: "قد تشمل البيانات التي يقدمها المستخدم أو تنتج عن استخدامه للموقع: بيانات الحساب والتواصل وطلبات العضوية والمراسلات والمعلومات الأسرية التي يقدمها بنفسه وسجلات الدخول والأمان والبيانات التقنية المرتبطة باستخدام الموقع. ويجب أن تكون معالجة البيانات لغرض مشروع ومحدد، وبالقدر اللازم لتحقيقه، ووفق مسوغ نظامي مناسب.",
        en: "Depending on the services used, information provided by the User or generated through use of the Website may include account and contact details, membership applications, correspondence, family information voluntarily submitted by the User, access and security logs, and technical data associated with Website use. Personal Data must be processed for a lawful and specific purpose, limited to what is necessary for that purpose, and on an appropriate legal basis.",
      },
      {
        ar: "قد تُستخدم البيانات لإدارة الحساب والتحقق من صلاحيات الوصول وتقديم الخدمات العائلية ومعالجة الطلبات وحفظ المواد التوثيقية وحماية أمن الموقع والوفاء بالالتزامات النظامية. ولا تُباع البيانات الشخصية. وقد تُتاح بالقدر اللازم لمقدمي الخدمات التقنية أو الجهات المختصة متى وجد مسوغ نظامي.",
        en: "Data may be used to manage accounts, verify access permissions, provide family services, respond to requests, maintain archival materials, protect Website security, and comply with legal obligations. Personal Data is not sold. It may be disclosed to technical service providers or competent authorities to the extent necessary and where there is a lawful basis.",
      },
      {
        ar: "قد يترتب على استخدام بعض الخدمات التقنية معالجة البيانات أو نقلها خارج المملكة؛ وتخضع أي عملية نقل للمتطلبات والضمانات النظامية الواجبة. ولا يجوز تفسير هذا الحكم على أنه موافقة مطلقة من المستخدم على أي نقل أو إفصاح.",
        en: "Certain technical services may involve processing or transferring data outside the Kingdom. Any such transfer is subject to applicable legal requirements and safeguards. Nothing in this provision constitutes blanket consent to any transfer or disclosure.",
      },
      {
        ar: "تُحفظ البيانات للمدة اللازمة لتحقيق الغرض الذي جُمعت من أجله والوفاء بالالتزامات النظامية، ثم تُتلف أو تُحذف أو تُزال هويتها متى انتفى مسوغ الاحتفاظ، مع مراعاة ما يقرره النظام من حالات استثناء أو مدد احتفاظ واجبة.",
        en: "Personal Data is retained for as long as necessary to fulfil the purpose for which it was collected and to meet legal obligations, after which it is deleted, destroyed, or de-identified when there is no longer a lawful basis for retention, subject to statutory exceptions or mandatory retention periods.",
      },
      {
        ar: "مع مراعاة أحكام النظام والاستثناءات الواردة فيه، يجوز لصاحب البيانات طلب العلم بمسوغ جمع بياناته والغرض من معالجتها، والوصول إليها والحصول على نسخة منها، وطلب تصحيحها أو استكمالها أو تحديثها، وطلب إتلافها، وسحب الموافقة حيث تكون الموافقة هي مسوغ المعالجة. وتُقدم الطلبات عبر وسائل التواصل الرسمية المنشورة على الموقع.",
        en: "Subject to the Law and its exceptions, a Data Subject may have the right to be informed of the legal basis and purpose for collecting their data, to access it and obtain a copy, to request correction, completion, or updating, to request destruction, and to withdraw consent where consent is the basis for processing. Requests may be submitted through the official contact channels published on the Website.",
      },
      {
        ar: "قد يستخدم الموقع ملفات تعريف الارتباط أو تقنيات مماثلة لأغراض التشغيل والأمان وتذكر التفضيلات وتحليل الاستخدام. ويكون استخدامها وفق الإعدادات والإشعارات المتاحة والمتطلبات النظامية ذات الصلة.",
        en: "The Website may use cookies or similar technologies for operation, security, remembering preferences, and analysing usage. Their use is subject to available notices and settings and applicable legal requirements.",
      },
    ],
  },
  {
    id: "images-minors",
    title: { ar: "المادة الثامنة: الصور والبيانات الخاصة والقاصرون", en: "Article 8: Images, Private Information, and Minors" },
    paragraphs: [
      {
        ar: "تُعد الصور ومقاطع الفيديو والتسجيلات الصوتية التي يمكن أن تحدد هوية شخص من البيانات الشخصية متى انطبق عليها تعريف النظام. ولا تمنح موافقة المستخدم على هذه الشروط إذناً عاماً بنشر صورة شخص آخر أو تسجيله أو بياناته.",
        en: "Photographs, videos, and audio recordings that identify a person may constitute Personal Data where the legal definition applies. Acceptance of these Terms does not grant general permission to publish another person’s image, recording, or Personal Data.",
      },
      {
        ar: "لا يجوز نشر صور القاصرين أو بياناتهم أو معلوماتهم الخاصة إلا وفق المتطلبات النظامية والحصول على الموافقات اللازمة من صاحب الصفة النظامية، حيث يلزم ذلك. كما يجب الامتناع عن نشر أرقام الهوية الوطنية أو العناوين أو بيانات الاتصال الخاصة أو أي معلومات قد تعرض الشخص للضرر أو انتهاك الخصوصية.",
        en: "Images, data, or private information concerning minors must not be published unless applicable legal requirements are met and any consent required from a person legally authorized to provide it has been obtained. Users should not publish national identification numbers, home addresses, private contact details, or information that may expose a person to harm or an infringement of privacy.",
      },
    ],
  },
  {
    id: "accuracy",
    title: { ar: "المادة التاسعة: دقة المعلومات وتوافر الخدمات", en: "Article 9: Accuracy of Information and Service Availability" },
    paragraphs: [
      {
        ar: "يُبذل ما يلزم لتقديم محتوى مفيد، إلا أن بعض المواد قد تكون تاريخية أو قيد التحقق أو غير محدثة أو تتضمن أخطاء غير مقصودة. ولا ينبغي الاعتماد على المحتوى وحده لإثبات حق قانوني أو نسب أو ملكية أو اتخاذ قرار ذي أثر قانوني أو مالي دون الرجوع إلى المستندات والجهات المختصة.",
        en: "Reasonable efforts may be made to provide useful Content; however, some material may be historical, under verification, outdated, incomplete, or contain inadvertent errors. Content should not be relied upon by itself to establish a legal right, genealogy, or ownership, or to make a decision with legal or financial consequences, without verification against relevant documents and competent authorities.",
      },
      {
        ar: "قد تتوقف بعض وظائف الموقع مؤقتاً أو تتغير أو تصبح غير متاحة لأسباب تقنية أو أمنية أو تشغيلية. وقد يحتوي الموقع على روابط لمواقع خارجية تخضع لشروطها وسياساتها المستقلة.",
        en: "Some Website functions may be temporarily suspended, changed, or unavailable for technical, security, or operational reasons. The Website may also contain links to external websites that are governed by their own terms and privacy policies.",
      },
    ],
  },
  {
    id: "liability",
    title: { ar: "المادة العاشرة: حدود المسؤولية", en: "Article 10: Limitation of Liability" },
    paragraphs: [
      {
        ar: "في الحدود التي يجيزها النظام، لا يتحمل الموقع مسؤولية إساءة استخدام المستخدم للمحتوى أو اعتماده على معلومات غير رسمية دون تحقق، أو أي ضرر ينشأ حصراً عن فعل المستخدم أو عن جهة خارجية لا تخضع لسيطرة الموقع. ولا يحد أي حكم في هذه الوثيقة من المسؤولية التي يوجب النظام عدم استبعادها أو من الحقوق النظامية للمستخدم.",
        en: "To the extent permitted by applicable law, no responsibility is assumed for a User’s misuse of Content, reliance on unofficial information without verification, or damage caused solely by the User or by an external party beyond the Website’s control. Nothing in these Terms excludes or limits liability that may not lawfully be excluded or limited, or restricts any statutory rights of the User.",
      },
      {
        ar: "لا تُعد المعلومات المنشورة استشارة قانونية أو مالية أو مهنية، ولا تمثل الوثائق أو الصور المعروضة تصديقاً على صحتها أو حجيتها إلا إذا ورد بيان صريح بذلك من جهة مختصة.",
        en: "Published information does not constitute legal, financial, or other professional advice. Documents or images displayed on the Website are not certified as authentic or legally conclusive unless expressly stated by a competent authority.",
      },
    ],
  },
  {
    id: "violations",
    title: { ar: "المادة الحادية عشرة: المخالفات والآثار", en: "Article 11: Violations and Consequences" },
    paragraphs: [
      {
        ar: "كل استخدام مخالف لهذه الشروط قد يترتب عليه تقييد الوصول إلى الخدمة أو تعليق الحساب أو إزالة المحتوى المخالف أو اتخاذ الإجراءات النظامية المناسبة، مع عدم الإخلال بحقوق المتضررين أو حق الجهات المختصة في اتخاذ ما يلزم بموجب النظام.",
        en: "A breach of these Terms or misuse of the Website may result in restricted access to a service, suspension of an account, removal of infringing Content, or appropriate legal action, depending on the nature of the breach and applicable law. This is without prejudice to the rights of affected persons or the powers of competent authorities.",
      },
    ],
  },
  {
    id: "amendments",
    title: { ar: "المادة الثانية عشرة: تعديل الشروط وقابليتها للفصل", en: "Article 12: Amendments and Severability" },
    paragraphs: [
      {
        ar: "تسري النسخة المنشورة على الموقع من تاريخ نشرها، ما لم يحدد فيها تاريخ نفاذ آخر. ويُطلب من المستخدم قبول أي تعديل متى كان ذلك لازماً نظاماً أو كان التعديل يستلزم موافقته. وإذا قُضي بعدم نفاذ حكم من أحكام هذه الوثيقة أو بطلانه، فلا يؤثر ذلك في بقية الأحكام بالقدر الذي يسمح به النظام.",
        en: "The version published on the Website shall apply from its publication date unless another effective date is specified. The User’s renewed acceptance shall be obtained where required by law or where an amendment requires the User’s consent. If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall remain effective to the extent permitted by law.",
      },
    ],
  },
  {
    id: "law",
    title: { ar: "المادة الثالثة عشرة: النظام الواجب التطبيق والاختصاص", en: "Article 13: Governing Law and Jurisdiction" },
    paragraphs: [
      {
        ar: "تخضع هذه الشروط وتُفسر وفق الأنظمة المعمول بها في المملكة العربية السعودية، بما في ذلك نظام حماية البيانات الشخصية ونظام حماية حقوق المؤلف والأنظمة الأخرى ذات الصلة. وتنعقد الولاية للجهات القضائية أو التنظيمية السعودية المختصة بحسب نوع النزاع وقواعد الاختصاص المقررة نظاماً.",
        en: "These Terms shall be governed by and construed in accordance with the laws and regulations in force in the Kingdom of Saudi Arabia, including the Saudi Personal Data Protection Law, the Saudi Copyright Law, and other relevant legislation. The competent Saudi judicial or regulatory authorities shall have jurisdiction as applicable to the nature of the dispute and the statutory rules governing jurisdiction.",
      },
    ],
  },
  {
    id: "acknowledgement",
    title: { ar: "المادة الرابعة عشرة: الإقرار الإلكتروني عند التسجيل", en: "Article 14: Electronic Acknowledgement on Registration" },
    paragraphs: [
      REGISTRATION_ACKNOWLEDGEMENT,
      {
        ar: "تُعد الموافقة الإلكترونية الصريحة الصادرة من حساب المستخدم عند التسجيل إقراراً بقبول هذه الشروط، مع مراعاة أحكام الأنظمة ذات الصلة بالإثبات والتعاملات الإلكترونية. ويُسجَّل إلكترونياً رقم إصدار الوثيقة وتاريخ ووقت القبول، ويمكن للعضو الاطلاع على نسخة قابلة للطباعة والتنزيل من صفحة حسابه.",
        en: "An express electronic acceptance given by the User through their account during registration constitutes an acknowledgement of acceptance of these Terms, subject to applicable laws governing evidence and electronic transactions. The document version and the date and time of acceptance are recorded electronically, and a printable, downloadable copy is available to the Member from their account page.",
      },
    ],
  },
  {
    id: "reporting",
    title: { ar: "الإبلاغ عن المحتوى", en: "Reporting Content" },
    paragraphs: [
      {
        ar: "إذا رأيت محتوى منشوراً على الموقع تعتقد أنه ينتهك حقوق المؤلف أو الخصوصية أو يكشف بيانات شخصية أو صوراً دون إذن، فيمكنك الإبلاغ عنه عبر نموذج «الإبلاغ عن محتوى» في صفحة التواصل، مع ذكر رابط الصفحة ووصف المخالفة وصفتك (صاحب الحق أو الشخص المعني أو وليه).",
        en: "If you believe content on the Website infringes copyright or privacy, or exposes personal data or images without permission, report it through the “Report content” form on the Contact page, including the page link, a description of the issue, and your capacity (rights holder, the person concerned, or their guardian).",
      },
      {
        ar: "تسجّل الأمانة البلاغ فور استلامه، وتحجب المحتوى المُبلَّغ عنه احترازياً متى ظهر أن فيه مساساً ظاهراً بالخصوصية أو بحقوق الغير، ثم تراجع البلاغ وتبلغ المُبلِّغ بالنتيجة. وعند حذف المحتوى أو تغيير مستوى إتاحته، تُطلب إزالته من نتائج محركات البحث وذاكرتها المؤقتة.",
        en: "The secretariat logs each report on receipt, takes the reported content down as a precaution where it appears to clearly affect privacy or third-party rights, then reviews the report and informs the reporter of the outcome. When content is removed or its visibility is changed, its removal from search-engine results and caches is requested.",
      },
    ],
  },
];

/**
 * The Privacy Policy describes what this site actually does with data. Keep it
 * in step with the code: if a provider, form, cookie or retention rule changes,
 * this text must change in the same commit.
 */
export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "controller",
    title: { ar: "١. من نحن وكيف تتواصل معنا", en: "1. Who we are and how to reach us" },
    paragraphs: [
      {
        ar: "الجهة المسؤولة عن معالجة بياناتك هي مجلس أسرة آل بوعبيد، وهو كيان أهلي مرخص مقره المبرز بمحافظة الأحساء. لأي استفسار أو طلب يتعلق ببياناتك الشخصية، راسلنا عبر نموذج التواصل في الموقع (باختيار «طلب يتعلق بالبيانات الشخصية») أو عبر البريد الرسمي المنشور في تذييل الموقع.",
        en: "The party responsible for processing your data is the Al Bu Obaid Family Council, a licensed nonprofit based in Al-Mubarraz, Al-Ahsa. For any question or request about your personal data, use the Website contact form (choose “Personal data request”) or the official email shown in the site footer.",
      },
    ],
  },
  {
    id: "collected",
    title: { ar: "٢. البيانات التي نجمعها", en: "2. The data we collect" },
    paragraphs: [
      {
        ar: "بيانات الحساب: الاسم والبريد الإلكتروني وكلمة المرور (تُحفظ مشفرة ولا نطّلع عليها)، وما تضيفه اختيارياً إلى ملفك: الاسم بالإنجليزية والفرع العائلي ورقم الجوال والمستوى التعليمي والمدينة والعنوان والصورة الشخصية، وخيار الظهور في دليل الأعضاء.",
        en: "Account data: your name, email address and password (stored hashed — we never see it), plus what you optionally add to your profile: English name, family branch, mobile number, education level, city, address, profile photo, and whether to appear in the member directory.",
      },
      {
        ar: "طلبات العضوية: الاسم الكامل وسلسلة النسب والفرع ووسيلة التواصل وأي ملاحظات تقدمها، وقرار الأمانة وملاحظتها وتاريخ المراجعة.",
        en: "Membership requests: full name, paternal lineage, branch, contact details and any notes you provide, together with the secretariat’s decision, note and review date.",
      },
      {
        ar: "الطلبات والنماذج: ما ترسله عبر مركز الطلبات ونموذج التواصل والترشيحات وتسجيل الفعاليات والمبادرات، بما في ذلك المرفقات التي ترفعها.",
        en: "Requests and forms: what you send through the Requests Hub, contact form, nominations, and event or initiative registrations, including any attachments you upload.",
      },
      {
        ar: "سجلات الموافقة: رقم إصدار الشروط التي قبلتها، وتاريخ ووقت القبول، والموافقات الاختيارية التي منحتها أو سحبتها، وعنوان IP ونوع المتصفح وقت القبول — لإثبات الموافقة.",
        en: "Consent records: the version of the terms you accepted, the date and time, the optional consents you gave or withdrew, and your IP address and browser type at that moment — kept as evidence of consent.",
      },
      {
        ar: "البيانات التقنية والأمنية: سجلات الدخول، وعنوان IP المستخدم لتقييد محاولات الإرسال المتكررة، وسجل العمليات الإدارية.",
        en: "Technical and security data: sign-in records, the IP address used to rate-limit repeated submissions, and an audit log of administrative actions.",
      },
    ],
  },
  {
    id: "purposes",
    title: { ar: "٣. لماذا نستخدمها والمسوغ النظامي", en: "3. Why we use it, and the legal basis" },
    paragraphs: [
      {
        ar: "إدارة حسابك والتحقق من انتسابك للأسرة واعتماد العضوية وتحديد صلاحيات الوصول (تنفيذ الخدمة التي طلبتها). الرد على طلباتك ومراسلاتك (تنفيذ الطلب). حماية الموقع من إساءة الاستخدام (المصلحة المشروعة). إرسال النشرة والرسائل التعريفية ونشر الصور والمقاطع التي تظهر فيها (موافقتك المستقلة فقط، ويمكنك سحبها في أي وقت). الوفاء بالالتزامات النظامية (الالتزام النظامي).",
        en: "Managing your account, verifying family membership, approving membership and setting access rights (performing the service you requested). Answering your requests and messages (performing the request). Protecting the Website against abuse (legitimate interest). Sending the newsletter and promotional emails, and publishing photos or videos in which you appear (your separate consent only — withdrawable at any time). Meeting legal obligations (legal obligation).",
      },
    ],
  },
  {
    id: "providers",
    title: { ar: "٤. الخوادم ومقدمو الخدمات التقنية", en: "4. Servers and technical service providers" },
    paragraphs: [
      {
        ar: "لا نبيع بياناتك ولا نشاركها لأغراض تسويقية. نستعين بمقدمي خدمات تقنية يعالجون البيانات نيابة عنا فقط وبالقدر اللازم: Supabase (قاعدة البيانات والمصادقة وتخزين الملفات)، وVercel (استضافة الموقع وتشغيله، ومنطقة التشغيل الأساسية دبلن – أيرلندا)، وCloudflare (شبكة توصيل المحتوى والحماية وخدمة Turnstile للتحقق من أن المرسل ليس آلياً)، وResend (إرسال رسائل البريد الإلكتروني الخاصة بالحساب والإشعارات).",
        en: "We do not sell your data or share it for marketing. We use technical providers that process data on our behalf only, and only as needed: Supabase (database, authentication and file storage), Vercel (website hosting and execution; primary region Dublin, Ireland), Cloudflare (content delivery, protection, and Turnstile bot verification), and Resend (sending account and notification emails).",
      },
      {
        ar: "نقل البيانات خارج المملكة: تقع خوادم بعض هؤلاء المزودين خارج المملكة العربية السعودية، ولذلك تُعالج بعض البيانات خارجها. نقصر ذلك على ما يلزم لتشغيل الخدمة، ونلتزم بلائحة نقل البيانات الشخصية إلى خارج المملكة والضمانات الواردة فيها.",
        en: "Transfers outside the Kingdom: some of these providers’ servers are located outside Saudi Arabia, so some data is processed there. We limit this to what is needed to run the service and follow the Regulation on Personal Data Transfer Outside the Kingdom and its safeguards.",
      },
      {
        ar: "قد نفصح عن بيانات للجهات المختصة متى وجد التزام نظامي بذلك.",
        en: "We may disclose data to competent authorities where a legal obligation requires it.",
      },
    ],
  },
  {
    id: "access",
    title: { ar: "٥. من يطّلع على البيانات داخل المجلس", en: "5. Who can see data inside the council" },
    paragraphs: [
      {
        ar: "يقتصر الاطلاع على بيانات الأعضاء وطلباتهم على أمانة المجلس والمكلفين بالمراجعة وفق أدوار وصلاحيات محددة، وتُسجَّل الإجراءات الإدارية في سجل العمليات. أرشيف الأسرة وصفحة صندوق التنمية العائلية متاحان للأعضاء المعتمدين فقط، والهوية البصرية لرئيس المجلس ورؤساء اللجان. لا تظهر بياناتك في دليل الأعضاء إلا إذا اخترت ذلك.",
        en: "Member data and requests are visible only to the council secretariat and assigned reviewers, under defined roles and permissions; administrative actions are recorded in an audit log. The family archive and the Family Development Fund pages are available to approved members only, and the visual identity to the council chair and committee chairs. Your details appear in the member directory only if you choose so.",
      },
      {
        ar: "الصفحات المقصورة على الأعضاء غير قابلة للفهرسة في محركات البحث. وعند تغيير مستوى إتاحة أي محتوى من عام إلى خاص أو حذفه، نحدّث خريطة الموقع وتعليمات الفهرسة ونطلب إزالة النسخ المخزنة مؤقتاً لدى محركات البحث.",
        en: "Members-only pages are excluded from search-engine indexing. When any content is changed from public to private, or removed, we update the sitemap and indexing directives and request removal of cached copies from search engines.",
      },
    ],
  },
  {
    id: "cookies",
    title: { ar: "٦. ملفات تعريف الارتباط والتخزين المحلي", en: "6. Cookies and local storage" },
    paragraphs: [
      {
        ar: "نستخدم الحد الأدنى فقط: ملف تعريف ارتباط مجهول (abf_visit_key) لعدّ الزيارات دون تحديد هويتك، والتخزين المحلي في متصفحك لحفظ جلسة الدخول ولغة العرض والمظهر، وملفات خدمة Cloudflare Turnstile الأمنية في النماذج. لا نستخدم ملفات تعريف ارتباط إعلانية أو أدوات تتبع لأطراف خارجية.",
        en: "We use the minimum only: an anonymous cookie (abf_visit_key) to count visits without identifying you; your browser’s local storage to keep you signed in and remember language and theme; and Cloudflare Turnstile security cookies on forms. We use no advertising cookies or third-party tracking tools.",
      },
    ],
  },
  {
    id: "retention",
    title: { ar: "٧. مدة الاحتفاظ والحذف", en: "7. Retention and deletion" },
    paragraphs: [
      {
        ar: "نحتفظ ببيانات الحساب ما دام الحساب قائماً. عند طلبك حذف الحساب نحذف بيانات ملفك وصورتك خلال ٣٠ يوماً، ونُبقي فقط ما يلزم نظاماً (مثل سجلات الموافقة والعمليات المالية) للمدة النظامية ثم نتلفه. تُحفظ الرسائل والطلبات للمدة اللازمة لمعالجتها ومتابعتها، وتُزال المرفقات متى انتهى الغرض منها. يمكنك إلغاء الاشتراك في النشرة في أي وقت فيتوقف الإرسال فوراً.",
        en: "We keep account data while the account exists. When you ask us to delete your account, we delete your profile data and photo within 30 days, keeping only what the law requires (such as consent records and financial transactions) for the statutory period before destroying it. Messages and requests are kept as long as needed to handle and follow them up, and attachments are removed once their purpose ends. You can unsubscribe from the newsletter at any time and sending stops immediately.",
      },
    ],
  },
  {
    id: "rights",
    title: { ar: "٨. حقوقك", en: "8. Your rights" },
    paragraphs: [
      {
        ar: "يحق لك العلم بكيفية معالجة بياناتك، والوصول إليها والحصول على نسخة منها، وطلب تصحيحها أو تحديثها، وطلب إتلافها، وسحب موافقتك على النشرة أو نشر الصور في أي وقت دون أن يؤثر ذلك على عضويتك. يمكنك تعديل معظم بياناتك وموافقاتك الاختيارية مباشرة من صفحة حسابك، ولبقية الطلبات راسلنا عبر نموذج التواصل وسنرد خلال ٣٠ يوماً. ويحق لك تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).",
        en: "You have the right to know how your data is processed, to access it and receive a copy, to ask for it to be corrected or updated, to ask for it to be destroyed, and to withdraw your newsletter or photo-publication consent at any time without affecting your membership. You can change most of your data and optional consents directly from your account page; for anything else, use the contact form and we will reply within 30 days. You may also lodge a complaint with the Saudi Data & AI Authority (SDAIA).",
      },
    ],
  },
  {
    id: "uploads",
    title: { ar: "٩. الصور والوثائق التي ترفعها", en: "9. Photos and documents you upload" },
    paragraphs: [
      {
        ar: "رافع الصورة أو الوثيقة هو المسؤول عن التأكد من امتلاكه الحقوق والأذونات اللازمة، بما في ذلك موافقة الأشخاص الظاهرين فيها أو أولياء القاصرين. تُحفظ المرفقات في تخزين غير عام ولا يطّلع عليها إلا المختصون بمعالجة الطلب. وللإبلاغ عن محتوى منشور، استخدم نموذج «الإبلاغ عن محتوى» في صفحة التواصل.",
        en: "Whoever uploads a photo or document is responsible for ensuring they hold the necessary rights and permissions, including the consent of the people shown or of minors’ guardians. Attachments are kept in non-public storage and seen only by those handling the request. To report published content, use the “Report content” form on the Contact page.",
      },
    ],
  },
  {
    id: "security",
    title: { ar: "١٠. أمن البيانات والإخطار بالحوادث", en: "10. Security and incident notification" },
    paragraphs: [
      {
        ar: "نستخدم الاتصال المشفر (HTTPS)، وسياسات أمان على مستوى صفوف قاعدة البيانات تمنع الاطلاع على بيانات غير مصرح بها، وتحققاً من الهوية لكل عملية إدارية. وفي حال وقوع حادثة تسرب تمس بياناتك، نُخطر الجهة المختصة وإياك وفق المدد النظامية.",
        en: "We use encrypted connections (HTTPS), row-level security policies in the database that block unauthorised access, and identity checks on every administrative action. If a breach affects your data, we notify the competent authority and you within the statutory timeframes.",
      },
    ],
  },
  {
    id: "changes",
    title: { ar: "١١. تحديث هذه السياسة", en: "11. Changes to this policy" },
    paragraphs: [
      {
        ar: "تُنشر أي نسخة محدثة على هذه الصفحة مع رقم إصدارها وتاريخ سريانها، ونطلب موافقتك المجددة متى كان التعديل يستلزمها.",
        en: "Any updated version is published on this page with its version number and effective date, and we ask for your renewed consent whenever a change requires it.",
      },
    ],
  },
];
