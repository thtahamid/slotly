import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This client should only be used in server components or server actions
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(supabaseUrl, supabaseKey)
}
