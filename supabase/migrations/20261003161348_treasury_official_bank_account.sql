-- Replace the placeholder (Alinma, blank numbers) with the fund's official
-- Bank Albilad record, the same values /contribute has shown since 26 Sep.
UPDATE public.site_settings
SET value = jsonb_set(
      value,
      '{bank_account}',
      coalesce(value->'bank_account', '{}'::jsonb) || jsonb_build_object(
        'bank_name_ar', 'بنك البلاد',
        'bank_name_en', 'Bank Albilad',
        'beneficiary_name_ar', 'صندوق التنمية العائلية',
        'beneficiary_name_en', 'Family Development Fund',
        'customer_number', '7001473102',
        'account_number', '999146092730006',
        'iban', 'SA1915000999146092730006'
      )
    ),
    updated_at = now()
WHERE key = 'treasury_config';
