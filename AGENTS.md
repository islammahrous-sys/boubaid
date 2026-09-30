<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Reuse `CommitteeYearGrid` for CMS-driven 1448 committee plan/archive records so both public placements follow the same reference and file-action rules.

- Page static text lives in `src/content/page-copy/*.ts` wrapped with `registerCopy(page, …)`; admin overrides are stored in site_settings `page_texts` and applied inside `t()` — keeps every page text editable without touching call sites.
- Award sponsors table defaults live in `src/content/award-sponsors.ts`; admin overrides in site_settings `award_sponsors`.
- Profile avatar uploads persist immediately through a dedicated authenticated server function; do not require a second profile-form save.

- Member-card PNG, PDF, and print outputs use one shared front/back landscape sheet so every format stays visually consistent and one-page.
