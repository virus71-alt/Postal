import { NextResponse } from 'next/server';
import { SITE } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export function GET() {
  const urls = [
    `${SITE}/`,
    `${SITE}/about/`,
    `${SITE}/methodology/`,
    `${SITE}/postal-code-guide/`,
    `${SITE}/contact/`,
    `${SITE}/privacy/`,
    `${SITE}/terms/`,
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
