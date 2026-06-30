import { NextResponse } from 'next/server';
import { SITE } from '@/lib/seo';
import { TARGET_COUNTRIES } from '@/config/buildConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sitemaps = TARGET_COUNTRIES.map(
    (cc) => `${SITE}/sitemaps/sitemap-${cc.toLowerCase()}.xml`
  );

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <sitemap><loc>${SITE}/sitemaps/static.xml</loc></sitemap>\n` +
    sitemaps
      .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
      .join('\n') +
    `\n</sitemapindex>\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
