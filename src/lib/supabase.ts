import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const backendConfigured = Boolean(url && key && !url.includes('SEU-PROJETO'))
export const demoMode = (import.meta.env.VITE_DEMO_MODE ?? 'true') !== 'false' || !backendConfigured

export const supabase = backendConfigured ? createClient(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null
