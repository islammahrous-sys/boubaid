DELETE FROM public.article_tag_relations WHERE article_id IN (SELECT id FROM public.articles);
DELETE FROM public.articles WHERE id IS NOT NULL;