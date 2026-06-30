import { NextResponse } from 'next/server';
import { TARGET_COUNTRIES } from '@/config/buildConfig';
import { countryName } from '@/lib/postalData';

export const dynamic = 'force-dynamic';

export function GET() {
  const list = TARGET_COUNTRIES.map((code) => ({
    code,
    name: countryName(code),
  })).sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(list, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
