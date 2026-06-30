import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');
  const q = searchParams.get('q');

  if (!country || !q) {
    return NextResponse.json({ pins: [], names: [] });
  }

  const cc = country.toUpperCase();
  const queryNorm = normalize(q.trim());

  if (queryNorm.length < 2) {
    return NextResponse.json({ pins: [], names: [] });
  }

  // Clean the search query for PostgREST ilike safety
  // (PostgREST uses % for wildcards, so escape or keep it simple)
  const cleanQ = q.replace(/[%_]/g, '');

  const { data, error } = await supabase
    .from('postal_codes')
    .select('place_name, postal_code, admin_name1, admin_name2')
    .eq('country_code', cc)
    .or(`place_name.ilike.${cleanQ}%,postal_code.ilike.${cleanQ}%`)
    .limit(50);

  if (error || !data) {
    console.error('[API Search] Supabase query error:', error?.message);
    return NextResponse.json({ pins: [], names: [] });
  }

  const pinsSet = new Set<string>();
  const namesMap = new Map<string, [string, string, string, number]>();

  for (const r of data) {
    if (r.postal_code && normalize(r.postal_code).startsWith(queryNorm)) {
      pinsSet.add(r.postal_code);
    }

    if (r.place_name) {
      const placeNorm = normalize(r.place_name);
      if (
        placeNorm.startsWith(queryNorm) ||
        placeNorm.split(/[^a-z0-9]+/).some((w) => w.startsWith(queryNorm))
      ) {
        const district = normalize(r.admin_name2 ?? '');
        const boost =
          district &&
          (placeNorm.startsWith(district) || district.startsWith(placeNorm))
            ? 1
            : 0;
        const key = `${placeNorm}|${r.postal_code}`;
        namesMap.set(key, [
          r.place_name,
          r.postal_code,
          r.admin_name1 ?? '',
          boost,
        ]);
      }
    }
  }

  const pinSuggestions = [...pinsSet].sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true })
  );

  const nameSuggestions = [...namesMap.values()].sort((a, b) => {
    return (
      (b[3] ?? 0) - (a[3] ?? 0) ||
      a[0].length - b[0].length ||
      a[0].localeCompare(b[0])
    );
  });

  return NextResponse.json({
    pins: pinSuggestions.slice(0, 10),
    names: nameSuggestions.slice(0, 10),
  });
}
