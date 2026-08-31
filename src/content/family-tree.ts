import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Shape of a documented individual on the public family-tree page.
 *
 * The hardcoded seed array that used to live here was retired: the tree is now
 * sourced only from Supabase (`family_members` + `family_relationships`), which
 * is itself seeded from the 12 official charts (see `src/content/tree/` and
 * `scripts/build-family-tree.ts`). The public tree deliberately carries no
 * national ID numbers, contact details, or dates of birth.
 */
export interface FamilyMemberNode {
  id: string;
  name: BiText;
  lineage: BiText;
  generation: number;
  generationTitle: BiText;
  branchId: string;
  branchName: BiText;
  ancestorName: BiText;
  settlement: BiText;
  title?: BiText;
  bio: BiText;
  relations: {
    father?: BiText;
    childrenCount?: number;
    subBranches?: BiText;
    lineageChain: BiText[];
  };
  keyAchievements?: BiText[];
  isPatriarch?: boolean;
  isBranchFounder?: boolean;
}
