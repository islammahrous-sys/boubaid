insert into public.membership_requests (full_name_ar, full_name_en, email, phone, branch_slug, father_lineage, notes, status)
values ('عبدالله بن محمد آل بوعبيد','Abdullah M. Al Bu Obaid','abdullah.demo@example.com','+966500000001','demo-branch','محمد بن عبيد','أرغب في تسجيل أسرتي في السجل العائلي.','pending'),
       ('نورة بنت سعد آل بوعبيد','Noura S. Al Bu Obaid','noura.demo@example.com','+966500000002','demo-branch','سعد بن عبيد','لدي وثائق قديمة أرغب بإضافتها للأرشيف.','pending');

insert into public.contact_messages (name, email, phone, subject, message, locale, status)
values ('فهد آل بوعبيد','fahad.demo@example.com','+966500000003','استفسار عن المبادرات','السلام عليكم، أرغب بمعرفة شروط برنامج المنح الدراسية.','ar','new'),
       ('سارة آل بوعبيد','sara.demo@example.com',null,'تحديث بيانات','أرجو تحديث رقم جوالي في السجل.','ar','new');

insert into public.newsletter_subscribers (email, name, locale, is_active)
values ('news1.demo@example.com','خالد آل بوعبيد','ar',true),
       ('news2.demo@example.com','منى آل بوعبيد','ar',true)
on conflict do nothing;

insert into public.contributions (user_id, contributor_name, email, amount, currency, method, purpose, reference, status)
values (null,'عبدالرحمن آل بوعبيد','abdulrahman.demo@example.com',5000,'SAR','bank_transfer','وقف الصندوق','TRF-2026-0142','pending'),
       (null,'هند آل بوعبيد','hind.demo@example.com',1200,'SAR','bank_transfer','برنامج المنح','TRF-2026-0143','verified');
