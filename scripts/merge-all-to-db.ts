import { createClient } from "@supabase/supabase-js";
import { siteMeta, branches, initiatives, achievers, libraryItems, news, dnaInfo, boardMembers, timeline, hqProject } from "../src/content/site";
import { familyMembersData } from "../src/content/family-tree";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywsvittlswbbyqhahorh.supabase.co";
// Service role key is required — the anon key cannot bypass RLS for seeding.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Set it in your .env before running this script.");
  process.exit(1);
}

console.log("Starting full website database merge...");
