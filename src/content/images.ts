import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Editorial imagery, assigned per page.
 *
 * Every picture on the site is either an entity's own image (a branch, a
 * person, a news story — those live beside their data in `site.ts`) or a
 * page-level figure declared here. Keeping the page figures in one file is
 * what stops the same photograph turning up as the header of four
 * different pages, which is how the site looked before.
 *
 * Each figure carries its own caption. A picture with no caption is
 * decoration; a picture with a caption is evidence.
 */

export interface Figure {
  src: string;
  caption: BiText;
}

export const pageImages = {
  home: {
    project: {
      src: "/images/hq_building.png",
      caption: {
        ar: "تصور معماري للمقر الدائم بحي الحزام الذهبي، المبرز.",
        en: "Architectural rendering of the permanent headquarters, Al-Hizam Al-Dhahabi, Al-Mubarraz.",
      },
    } satisfies Figure,
  },

  about: {
    /** Named for this page in the original asset set — used as its plate. */
    header: {
      src: "/images/about-historic-mubarraz.png",
      caption: {
        ar: "مدينة المبرز التاريخية بواحة الأحساء — موطن استقرار الأسرة.",
        en: "The historic town of Al-Mubarraz in the Al-Ahsa oasis — where the family settled.",
      },
    } satisfies Figure,
    plates: [
      {
        src: "/images/ahsa_oasis.png",
        caption: {
          ar: "واحة الأحساء — أكبر واحة نخيل في العالم، ومحيط الأسرة الزراعي والتجاري.",
          en: "The Al-Ahsa oasis — the largest palm oasis in the world, and the family's agricultural and commercial setting.",
        },
      },
      {
        src: "/images/library-deed-1102.png",
        caption: {
          ar: "وثيقة وقفية شرعية مؤرخة سنة ١١٠٢ هـ من سجلات محاكم الأحساء.",
          en: "A sharia endowment deed dated 1102 AH from the Al-Ahsa court registers.",
        },
      },
      {
        src: "/images/saudi_majlis_custom.png",
        caption: {
          ar: "الديوانية — مجلس الأسرة التقليدي الذي تنتقل فيه الرواية بين الأجيال.",
          en: "The diwaniyah — the traditional majlis through which family narrative passes between generations.",
        },
      },
      {
        src: "/images/ahsa_oasis_custom.png",
        caption: {
          ar: "نخيل الأحساء — الأوقاف الزراعية التي قامت عليها موارد الأسرة القديمة.",
          en: "The palm groves of Al-Ahsa — the agricultural endowments on which the family's early resources rested.",
        },
      },
    ] satisfies Figure[],
  },

  foundation: {
    header: {
      src: "/images/governance_custom.png",
      caption: {
        ar: "اجتماع مجلس الأمناء واللجان التنفيذية — المبرز، الأحساء.",
        en: "A sitting of the board of trustees and standing committees — Al-Mubarraz, Al-Ahsa.",
      },
    } satisfies Figure,
    committees: {
      src: "/images/governance_custom.png",
      caption: {
        ar: "أعمال اللجان التنفيذية الخمس المنبثقة عن مجلس الأمناء.",
        en: "The five standing committees issuing from the board of trustees at work.",
      },
    } satisfies Figure,
  },

  initiatives: {
    /** Deliberately a different rendering from the one on the home page. */
    flagship: {
      src: "/images/hq_render_custom.png",
      caption: {
        ar: "المخطط المعتمد للمقر الدائم — قاعات المناسبات ومقر اللجان والمكتبة.",
        en: "The approved plan for the permanent headquarters — assembly halls, committee offices, and the library.",
      },
    } satisfies Figure,
  },

  contact: {
    seat: {
      src: "/images/family_majlis.png",
      caption: {
        ar: "مجلس الأسرة بالمبرز — مقر اجتماعات الأمانة العامة واللجان.",
        en: "The family majlis at Al-Mubarraz — where the secretariat and committees convene.",
      },
    } satisfies Figure,
  },

  contribute: {
    endowment: {
      src: "/images/ramadan_community.png",
      caption: {
        ar: "من برامج التكافل الرمضانية الممولة من اشتراكات أبناء الأسرة.",
        en: "One of the Ramadan solidarity programmes funded by members' subscriptions.",
      },
    } satisfies Figure,
  },

  library: {
    header: {
      src: "/images/digital_library_archive.png",
      caption: {
        ar: "أرشيف الوثائق والمخطوطات قيد الرقمنة.",
        en: "The documentary and manuscript archive under digitisation.",
      },
    } satisfies Figure,
    /** Contact-sheet order for the photographic collection. */
    contactSheet: [
      "/images/library-digital-archives.png",
      "/images/library-deed-1102.png",
      "/images/library_archive_custom.png",
      "/images/governance_custom.png",
      "/images/saudi_majlis_custom.png",
      "/images/ramadan_custom.png",
      "/images/academic_custom.png",
      "/images/hq_render_custom.png",
    ],
  },
} as const;

/**
 * Portraits of branch patriarchs, where one exists.
 *
 * Only the two branches whose portrait files the original asset set names
 * explicitly are mapped. The rest fall back to the branch plate — a wrong
 * face against a named ancestor would be worse than none.
 */
export const branchPortraits: Record<string, string> = {
  "al-mohammed-ahmed": "/images/sheikh-mohammed-ahmed.png",
  "al-yousef": "/images/sheikh-yousef.png",
};

export const initiativeImages: Record<string, string> = {
  "excellence-award": "/images/academic_awards.png",
  headquarters: "/images/hq_render_custom.png",
  "ramadan-quiz": "/images/ramadan_community.png",
  "youth-training": "/images/academic_custom.png",
  "eid-gatherings": "/images/family_majlis.png",
  "national-volunteering": "/images/governance_custom.png",
};

export const initiativeImageFallback = "/images/family_majlis.png";

export function initiativeImage(slug: string): string {
  return initiativeImages[slug] ?? initiativeImageFallback;
}
