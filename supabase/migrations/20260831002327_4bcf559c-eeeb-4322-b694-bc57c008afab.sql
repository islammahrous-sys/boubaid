DELETE FROM public.branches
WHERE slug = 'al-abdulrahman'
  AND NOT EXISTS (SELECT 1 FROM public.family_members m WHERE m.branch_id = public.branches.id);

WITH ordered AS (
  SELECT id, row_number() OVER (ORDER BY sort_order, name_ar) AS rn
  FROM public.branches
)
UPDATE public.branches b
SET sort_order = o.rn, updated_at = now()
FROM ordered o
WHERE b.id = o.id AND b.sort_order <> o.rn;