import { createClient } from "@supabase/supabase-js";
import { siteMeta, branches, initiatives, achievers, libraryItems, news, dnaInfo, boardMembers, timeline, hqProject } from "../src/content/site";
import { familyMembersData } from "../src/content/family-tree";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywsvittlswbbyqhahorh.supabase.co";
// Using legacy service role / admin or publishable
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZpdHRsc3diYnlxaGFob3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgwODcsImV4cCI6MjEwMjkwNDA4N30.TK3AgqMh5vHDzi16S7ILBP7fyIwoKuDDJURjT9r26K4";

console.log("Starting full website database merge...");
