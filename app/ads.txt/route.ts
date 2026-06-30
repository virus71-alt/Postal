import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-1234567890123456';
  // Extract only the publisher numbers (e.g. ca-pub-1234 -> pub-1234)
  const pubId = client.startsWith('ca-') ? client.slice(3) : client;
  const body = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
