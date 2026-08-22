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
    heritage: {
      src: "/images/heritage_grove_dawn.jpg",
      caption: {
        ar: "بستان نخيل تاريخي بواحة الأحساء عند الفجر — المشهد الذي تدور حوله الأوقاف والعائلة.",
        en: "A historic palm grove at dawn in the Al-Ahsa oasis — the landscape around which the family's endowments have turned.",
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
      {
        src: "/images/about_old_mubarraz_fort.png",
        caption: {
          ar: "عمارة المبرز التاريخية وأبراجها القديمة — شاهد على عراقة التأسيس والاستقرار الحصين.",
          en: "The historic architecture and watchtowers of Al-Mubarraz — a testament to early fortified settlement.",
        },
      },
      {
        src: "/images/about_arabian_caravan.png",
        caption: {
          ar: "قوافل التجارة في واحة الأحساء — النشاط التجاري والربط الاقتصادي عبر طرق القوافل التاريخية.",
          en: "Trade caravans in the Al-Ahsa oasis — commercial enterprise and connectivity along historic caravan routes.",
        },
      },
      {
        src: "/images/about_tamim_majlis.png",
        caption: {
          ar: "ديوان القبيلة ومجلس الوجهاء في صدر التاريخ — جذور الانتماء إلى بني تميم والمحافظة على القيم.",
          en: "The tribal council and gathering of elders in early history — roots in Banu Tamim and the preservation of heritage.",
        },
      },
    ] satisfies Figure[],
    dnaAbstract: {
      src: "/images/about_dna_abstract.jpg",
      caption: {
        ar: "تصوير تجريدي للشجرة الجينية — ربط النسب الكتابي بالأدلة الجينية.",
        en: "An abstract rendering of the genetic family tree — connecting written lineage with genetic evidence.",
      },
    } satisfies Figure,
  },

  foundation: {
    header: {
      src: "/images/foundation_trustees_hall.png",
      caption: {
        ar: "قاعة اجتماعات مجلس الأمناء — حوكمة مؤسسية تجمع بين أصالة التراث الأحسائي وحداثة الإدارة.",
        en: "The Board of Trustees assembly hall — institutional governance blending Al-Ahsa heritage with modern administration.",
      },
    } satisfies Figure,
    committees: {
      src: "/images/governance_council.png",
      caption: {
        ar: "أعمال اللجان التنفيذية الخمس المنبثقة عن مجلس الأمناء والإشراف على المشاريع.",
        en: "The five standing committees issuing from the board of trustees supervising projects at work.",
      },
    } satisfies Figure,
    endowment: {
      src: "/images/foundation_palm_endowment.png",
      caption: {
        ar: "أوقاف النخيل وعيون المياه بالأحساء — الركيزة الاقتصادية المستدامة للمشاريع العائلية والخيرية.",
        en: "Palm endowments and water channels in Al-Ahsa — the sustainable economic foundation for family and charitable projects.",
      },
    } satisfies Figure,
    secretariat: {
      src: "/images/foundation_secretariat.png",
      caption: {
        ar: "مكتب الأمانة العامة — حيث تُحال المراسلات إلى اللجان المختصة وتُدون قرارات الحوكمة.",
        en: "The secretariat office — where correspondence is routed to committees and governance resolutions are recorded.",
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
    stewardship: {
      src: "/images/contribute_stewardship.jpg",
      caption: {
        ar: "رعاية أشجار النخيل بأوقاف الأسرة — استمرار مبدأ الوقف بأيدي الجيل الحاضر.",
        en: "Tending the family's endowed palm grove — the principle of waqf carried forward by the present generation.",
      },
    } satisfies Figure,
  },

  achievers: {
    header: {
      src: "/images/achievers_hall_plate.jpg",
      caption: {
        ar: "قاعة تكريم المتفوقين — الاحتفاء السنوي بأبناء الأسرة المتميزين في العلم والعمل.",
        en: "The honours hall — the family's annual recognition of members distinguished in learning and service.",
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
      "/images/academic_custom.png",
      "/images/library_archive_custom.png",
      "/images/library_manuscript_room.png",
      "/images/library_ancient_deed.png",
      "/images/library_digital_lab.png",
      "/images/governance_custom.png",
      "/images/ramadan_custom.png",
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
  "excellence-award": "/images/initiative_excellence_ceremony.png",
  headquarters: "/images/hq_initiative_card.png",
  "ramadan-quiz": "/images/initiative_ramadan_gathering.png",
  "youth-training": "/images/initiative_youth_hub.png",
  "eid-gatherings": "/images/initiative_eid_gathering.png",
  "national-volunteering": "/images/initiative_volunteering.png",
};

export const initiativeImageFallbackCultural = "/images/fallback_initiative_cultural.jpg";
export const initiativeImageFallbackSocial = "/images/fallback_initiative_social.jpg";

export function initiativeImage(slug: string): string {
  if (initiativeImages[slug]) return initiativeImages[slug];
  return slug === "headquarters" ? initiativeImageFallbackCultural : initiativeImageFallbackSocial;
}

/** @deprecated kept for compatibility */
export const initiativeImageFallback = initiativeImageFallbackSocial;
