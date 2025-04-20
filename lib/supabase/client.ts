import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This client should only be used in client components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
