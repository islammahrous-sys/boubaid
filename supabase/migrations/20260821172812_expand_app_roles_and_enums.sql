-- Expand app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'family_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';

-- Additional Enums
DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.gender AS ENUM ('male', 'female');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.visibility_level AS ENUM ('public', 'family_only', 'admin_only', 'private');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.record_status AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.relationship_type AS ENUM ('parent', 'child', 'spouse');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
