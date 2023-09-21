import {createClient} from '@supabase/supabase-js'
const supabase=createClient(import.meta.env.VITE_SUPABASE_PROJECT_URL,import.meta.env.VITE_SUPABASE_PUBLIC_API_KEY)
export default supabase;