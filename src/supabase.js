import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pjbmkjcpxyoszybjmiif.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYm1ramNweHlvc3p5YmptaWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDA5OTQsImV4cCI6MjA4MTYxNjk5NH0.tBj4VlQaQYHDxIf6aYhgp1r5YutDByjwqAAEHKCStko";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
