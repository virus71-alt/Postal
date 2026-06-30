import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid latitude or longitude value' }, { status: 400 });
  }

  try {
    // 1. Query within a narrow bounding box (approx. 20km)
    let delta = 0.2;
    let { data, error } = await supabase
      .from('postal_codes')
      .select('postal_code, country_code, latitude, longitude, place_name')
      .gte('latitude', lat - delta)
      .lte('latitude', lat + delta)
      .gte('longitude', lng - delta)
      .lte('longitude', lng + delta)
      .limit(100);

    if (error) throw error;

    // 2. Fallback to a wider bounding box if no results (approx. 100km)
    if (!data || data.length === 0) {
      delta = 1.0;
      const retry = await supabase
        .from('postal_codes')
        .select('postal_code, country_code, latitude, longitude, place_name')
        .gte('latitude', lat - delta)
        .lte('latitude', lat + delta)
        .gte('longitude', lng - delta)
        .lte('longitude', lng + delta)
        .limit(100);

      if (retry.error) throw retry.error;
      data = retry.data;
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No nearby postal codes found' }, { status: 404 });
    }

    // 3. Find the exact closest row using Euclidean distance in JS
    const getDistanceSq = (p: any) => {
      const dLat = (p.latitude || 0) - lat;
      const dLng = (p.longitude || 0) - lng;
      return dLat * dLat + dLng * dLng;
    };

    data.sort((a, b) => getDistanceSq(a) - getDistanceSq(b));
    const closest = data[0];

    return NextResponse.json({
      postal_code: closest.postal_code,
      country_code: closest.country_code,
      place_name: closest.place_name,
    });
  } catch (err: any) {
    console.error('[Reverse Geocode API] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
