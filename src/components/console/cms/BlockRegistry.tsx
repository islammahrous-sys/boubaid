import {
  LayoutTemplate,
  FileText,
  Image as ImageIcon,
  Images,
  Video,
  Quote,
  Clock,
  Sparkles,
  GitBranch,
  Network,
  Calendar,
  Newspaper,
  Bell,
  BarChart3,
  CreditCard,
  Send,
  MapPin,
  Mail,
  Minus,
} from "lucide-react";

export type BlockType =
  | "hero"
  | "rich_text"
  | "image"
  | "gallery"
  | "video"
  | "quote"
  | "timeline"
  | "member_spotlight"
  | "branches"
  | "tree"
  | "events"
  | "articles"
  | "announcements"
  | "statistics"
  | "cards"
  | "cta"
  | "map"
  | "contact"
  | "divider";

export type BlockMeta = {
  type: BlockType;
  label_ar: string;
  label_en: string;
  description_ar: string;
  description_en: string;
  icon: any;
  defaultData: Record<string, any>;
};

export const BLOCK_DEFINITIONS: Record<BlockType, BlockMeta> = {
  hero: {
    type: "hero",
    label_ar: "قسم الترويسة الرئيسية (Hero)",
    label_en: "Hero Section",
    description_ar: "عنوان كبير، نص فرعي، صورة خلفية وأزرار تحويل",
    description_en: "Prominent banner with title, subtitle, CTA buttons",
    icon: LayoutTemplate,
    defaultData: {
      title_ar: "أهلاً بكم في بوابة أسرة آل بوعبيد",
      title_en: "Welcome to Al Bu Obaid Family Hub",
      subtitle_ar: "ملتقى العائلة وأرشيف التراث والنسب والمبادرات",
      subtitle_en: "Family lineage, heritage archive, and community initiatives",
      button_text_ar: "استكشف الشجرة",
      button_url: "/family-tree",
      bg_image_url: "",
    },
  },
  rich_text: {
    type: "rich_text",
    label_ar: "نص غني (Rich Text)",
    label_en: "Rich Text Content",
    description_ar: "محتوى نصي مع فقرات وتنسيق وروابط",
    description_en: "Formatted paragraphs, lists, and headings",
    icon: FileText,
    defaultData: {
      content_ar: "اكتب محتوى الصفحة هنا...",
      content_en: "Write your page content here...",
    },
  },
  image: {
    type: "image",
    label_ar: "صورة مفردة",
    label_en: "Single Image",
    description_ar: "صورة بارزة مع تعليق توضيحي",
    description_en: "Featured image with caption",
    icon: ImageIcon,
    defaultData: {
      url: "",
      caption_ar: "",
      caption_en: "",
      alt_ar: "",
    },
  },
  gallery: {
    type: "gallery",
    label_ar: "معرض صور (Gallery)",
    label_en: "Photo Gallery",
    description_ar: "شبكة صور متعددة متجاوبة",
    description_en: "Grid of images with lightbox preview",
    icon: Images,
    defaultData: {
      columns: 3,
      gallery_id: null,
    },
  },
  video: {
    type: "video",
    label_ar: "مقطع فيديو",
    label_en: "Video Embed",
    description_ar: "تضمين فيديو من يوتيوب أو رابط مباشر",
    description_en: "Video player from URL or YouTube",
    icon: Video,
    defaultData: {
      url: "",
      title_ar: "",
    },
  },
  quote: {
    type: "quote",
    label_ar: "اقتباس مميز (Quote)",
    label_en: "Blockquote",
    description_ar: "اقتباس مع اسم القائل والمصدر",
    description_en: "Featured quote with author citation",
    icon: Quote,
    defaultData: {
      quote_ar: "صلة الرحم تزيد في العمر وتبارك في الرزق",
      quote_en: "Family bonds bring blessings and strength",
      author_ar: "حكمة مأثورة",
      author_en: "Traditional Proverb",
    },
  },
  timeline: {
    type: "timeline",
    label_ar: "خط زمني تاريخي (Timeline)",
    label_en: "Historical Timeline",
    description_ar: "تسلسل الأحداث والمحطات التاريخية للأسرة",
    description_en: "Chronological milestone sequence",
    icon: Clock,
    defaultData: {
      items: [
        {
          year: "1340 هـ",
          title_ar: "تأسيس المجلس العائلي",
          title_en: "Establishment of the Council",
          description_ar: "",
          description_en: "",
        },
      ],
    },
  },
  member_spotlight: {
    type: "member_spotlight",
    label_ar: "شخصية مميزة (Member Spotlight)",
    label_en: "Member Spotlight",
    description_ar: "إبراز أحد أعلام أو كفاءات الأسرة",
    description_en: "Highlight a distinguished family achiever",
    icon: Sparkles,
    defaultData: {
      member_id: null,
      highlight_ar: "شخصية هذا الشهر",
      highlight_en: "Member of the Month",
    },
  },
  branches: {
    type: "branches",
    label_ar: "شبكة فروع الأسرة",
    label_en: "Family Branches Grid",
    description_ar: "عرض الفروع السبعة مع عمداء الفروع وروابطها",
    description_en: "Display family branches with details",
    icon: GitBranch,
    defaultData: {
      show_elders: true,
    },
  },
  tree: {
    type: "tree",
    label_ar: "معاينة شجرة الأسرة (Tree Embed)",
    label_en: "Family Tree Embed",
    description_ar: "كتلة تفاعلية لاستعراض شجرة الأنساب",
    description_en: "Interactive visual family tree widget",
    icon: Network,
    defaultData: {
      max_generations: 4,
    },
  },
  events: {
    type: "events",
    label_ar: "الفعاليات القادمة (Events)",
    label_en: "Upcoming Events Grid",
    description_ar: "بطاقات اللقاءات والاجتماعات العائلية القادمة",
    description_en: "Upcoming gatherings and council meetings",
    icon: Calendar,
    defaultData: {
      limit: 3,
    },
  },
  articles: {
    type: "articles",
    label_ar: "أحدث المقالات والأخبار (Articles)",
    label_en: "Latest Articles Grid",
    description_ar: "أخبار الصندوق والمركز الإعلامي",
    description_en: "Latest news and articles list",
    icon: Newspaper,
    defaultData: {
      limit: 3,
    },
  },
  announcements: {
    type: "announcements",
    label_ar: "شريط التنبيهات والإعلانات",
    label_en: "Announcements Banner",
    description_ar: "إعلان عاجل أو تعميم رسمي من أمانة المجلس",
    description_en: "Official alerts and council announcements",
    icon: Bell,
    defaultData: {
      style: "banner",
    },
  },
  statistics: {
    type: "statistics",
    label_ar: "إحصائيات وأرقام (Stats Counter)",
    label_en: "Statistics Grid",
    description_ar: "أرقام الأفراد، الفروع، المبادرات، والوثائق",
    description_en: "Numbers of members, branches, initiatives",
    icon: BarChart3,
    defaultData: {
      items: [
        { number: "7", label_ar: "فروع عائلية", label_en: "Branches" },
        { number: "1200+", label_ar: "فرد موثق", label_en: "Documented Members" },
        { number: "100%", label_ar: "حوكمة وترخيص", label_en: "Governance" },
      ],
    },
  },
  cards: {
    type: "cards",
    label_ar: "بطاقات مميزات (Feature Cards)",
    label_en: "Feature Cards",
    description_ar: "بطاقات تعريفية بأهداف الصندوق وبرامجه",
    description_en: "Grid of feature cards with icons and links",
    icon: CreditCard,
    defaultData: {
      cards: [
        { title_ar: "التكافل العائلي", title_en: "Social Solidarity", desc_ar: "دعم ورعاية الأسر والمبادرات", desc_en: "", link_url: "" },
        { title_ar: "التوثيق والأرشيف", title_en: "Genealogy & Archive", desc_ar: "حفظ التاريخ والوثائق والنسب", desc_en: "", link_url: "" },
      ],
    },
  },
  cta: {
    type: "cta",
    label_ar: "دعوة للتفاعل (Call to Action)",
    label_en: "Call to Action",
    description_ar: "بطاقة بارزة للتسجيل في السجل أو المساهمة",
    description_en: "Prominent conversion banner with button",
    icon: Send,
    defaultData: {
      title_ar: "انضم إلى السجل العائلي الرقمي",
      title_en: "Join the Family Digital Registry",
      desc_ar: "سجل بياناتك وبيانات أسرتك لتوثيق النسب والاستفادة من خدمات الصندوق",
      button_text_ar: "طلب تسجيل عضوية",
      button_url: "/contact",
    },
  },
  map: {
    type: "map",
    label_ar: "خريطة ومواقع (Places Map)",
    label_en: "Map & Locations",
    description_ar: "عرض مواقع ديوانيات ومقار فروع الأسرة",
    description_en: "Interactive locations of council diwaniyas",
    icon: MapPin,
    defaultData: {
      title_ar: "مقر الأمانة وديوانيات الأسرة",
      address: "",
      embed_url: "",
    },
  },
  contact: {
    type: "contact",
    label_ar: "نموذج تواصل مباشر (Contact Form)",
    label_en: "Contact Form",
    description_ar: "تضمين نموذج إرسال استفسار أو مقترح",
    description_en: "Direct inquiry form connected to admin inbox",
    icon: Mail,
    defaultData: {
      title_ar: "تواصل مع أمانة مجلس الأسرة",
    },
  },
  divider: {
    type: "divider",
    label_ar: "فاصل جمالي (Divider)",
    label_en: "Visual Divider",
    description_ar: "خط فاصل بين الأقسام",
    description_en: "Decorative divider between content sections",
    icon: Minus,
    defaultData: {
      style: "ornament",
    },
  },
};
