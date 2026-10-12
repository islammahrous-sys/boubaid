DELETE FROM public.navigation_items
WHERE parent_id = 'fd000000-0000-0000-0000-000000000003'
  AND id IN (
    'cf7a3b87-ac0e-4ab7-a569-124f5f33f836',
    '07c22c56-29b7-4d29-ba01-6eaf852554b4'
  );