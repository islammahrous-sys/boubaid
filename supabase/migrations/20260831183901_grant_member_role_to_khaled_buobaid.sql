
-- Dr. Khaled Y. Al Bu Obaid was created directly as super_admin
-- and never filed a membership request, so he had no `member` role and the
-- account page hid the apply button. Grant the member role directly, matching
-- what review_membership_request_as_admin() does on approval.
insert into public.user_roles (user_id, role, granted_by)
values (
  '04781fb8-0cc5-4319-ae8c-8e7cfb2953b1',
  'member'::public.app_role,
  '001ef597-e5db-44fe-95b9-6b9c9b6b002e'
)
on conflict (user_id, role) do nothing;
