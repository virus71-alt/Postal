import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail the build loudly if credentials are missing — otherwise
// generateStaticParams would silently produce zero pages.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Set them in .env.local (or your CI environment) before building.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This client only runs at build time in Node — no browser session needed.
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Shape of a row in the `postal_codes` table.
export interface PostalCodeRow {
  country_code: string;
  postal_code: string;
  place_name: string;
  admin_name1: string | null;
  admin_name2: string | null;
  admin_name3: string | null;
  lat: number | null;
  lng: number | null;
}
