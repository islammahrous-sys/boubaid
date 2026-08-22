/**
 * Illustration for each news item, keyed by slug.
 *
 * Kept out of the route files so the index and the article page cannot
 * drift apart — they previously carried two separate copies of this map
 * that pointed at different images for the same story.
 */
export const newsImages: Record<string, string> = {
  "ncnp-license-issuance": "/images/news_ncnp_license.png",
  "hq-land-hizam-dhahabi": "/images/news-hq-development.png",
  "excellence-award-1447": "/images/news_excellence_1447.png",
  "ramadan-quiz-series": "/images/news_ramadan_quiz.png",
};

export const newsImageFallback = "/images/fallback_news.jpg";

export function newsImage(slug: string): string {
  return newsImages[slug] ?? newsImageFallback;
}
