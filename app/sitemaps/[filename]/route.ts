import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { SITE } from '@/lib/seo';
import { slugify } from '@/lib/slug';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const match = filename.match(/^sitemap-([a-z]{2})\.xml$/);
  if (!match) return new NextResponse('Not Found', { status: 404 });
  const cc = match[1].toUpperCase();

  const urls: string[] = [];
  const lc = cc.toLowerCase();

  // 1. Add country directory URL
  urls.push(`${SITE}/directory/${lc}/`);

  const seenStates = new Set<string>();
  const seenDistricts = new Set<string>();
  const pinsSet = new Set<string>();

  let from = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('postal_codes')
      .select('postal_code, admin_name1, admin_name2')
      .eq('country_code', cc)
      .range(from, from + limit - 1);

    if (error) {
      console.error(`[Sitemap Generator] Supabase error for ${cc}:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;

    for (const r of data) {
      const stateSlug = slugify((r.admin_name1 ?? 'Other').trim() || 'Other');
      const districtSlug = slugify((r.admin_name2 ?? 'Other').trim() || 'Other');

      if (!seenStates.has(stateSlug)) {
        seenStates.add(stateSlug);
        urls.push(`${SITE}/browse/${lc}/${stateSlug}/`);
      }

      const dKey = `${stateSlug}/${districtSlug}`;
      if (!seenDistricts.has(dKey)) {
        seenDistricts.add(dKey);
        urls.push(`${SITE}/browse/${lc}/${stateSlug}/${districtSlug}/`);
      }

      if (r.postal_code) {
        pinsSet.add(r.postal_code);
      }
    }

    if (data.length < limit) break;
    from += limit;
  }

  for (const pin of pinsSet) {
    urls.push(`${SITE}/directory/${lc}/${encodeURIComponent(pin.toLowerCase())}/`);
  }

  const xmlEscape = (u: string) =>
    u.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`).join('\n') +
    `\n</urlset>\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
