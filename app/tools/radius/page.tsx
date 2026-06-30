import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { supabase } from '@/lib/supabase';
import { SITE, WEBSITE_ID } from '@/lib/seo';
import { TARGET_COUNTRIES } from '@/config/buildConfig';
import { countryName } from '@/lib/postalData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ZIP & Postal Code Radius Search Tool — PostalAtlas',
  description: 'Find all ZIP or postal codes within a specific radius (miles or kilometers) of any postal code instantly.',
};

interface PageProps {
  searchParams: Promise<{
    postal_code?: string;
    radius?: string;
    unit?: string;
    country?: string;
  }>;
}

export default async function RadiusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const targetCode = (params.postal_code || '').trim().toUpperCase();
  const radiusVal = parseFloat(params.radius || '10');
  const unit = (params.unit || 'km').trim().toLowerCase();
  const country = (params.country || 'US').trim().toUpperCase();

  const countriesList = TARGET_COUNTRIES.map((code) => ({
    code,
    name: countryName(code),
  })).sort((a, b) => a.name.localeCompare(b.name));

  let errorMsg: string | null = null;
  let center: any = null;
  let results: {
    postal_code: string;
    place_name: string;
    admin_name1: string | null;
    distance: number;
    latitude: number;
    longitude: number;
  }[] = [];

  if (targetCode && !isNaN(radiusVal)) {
    try {
      // 1. Get center postal code coordinates
      const { data: centerData, error: centerErr } = await supabase
        .from('postal_codes')
        .select('postal_code, place_name, admin_name1, lat, lng')
        .eq('country_code', country)
        .eq('postal_code', targetCode)
        .limit(1);

      if (centerErr) throw centerErr;

      const centerRow = centerData?.[0];

      if (!centerRow) {
        errorMsg = `Center postal code "${targetCode}" was not found in ${countryName(country)}.`;
      } else if (centerRow.lat === null || centerRow.lng === null) {
        errorMsg = `Coordinates are missing for the starting postal code "${targetCode}".`;
      } else {
        const lat = Number(centerRow.lat);
        const lng = Number(centerRow.lng);
        center = {
          ...centerRow,
          latitude: lat,
          longitude: lng,
        };

        // 2. Determine radius in km
        const rKm = unit === 'miles' ? radiusVal * 1.60934 : radiusVal;

        // Approx delta latitude/longitude for bounding box
        // 1 deg lat = 111km, 1 deg lng = 111km * cos(lat)
        const deltaLat = rKm / 111.0;
        const deltaLng = rKm / (111.0 * Math.cos((lat * Math.PI) / 180));

        // 3. Query bounding box in database
        const { data: candidates, error: queryErr } = await supabase
          .from('postal_codes')
          .select('postal_code, place_name, admin_name1, lat, lng')
          .eq('country_code', country)
          .gte('lat', lat - deltaLat)
          .lte('lat', lat + deltaLat)
          .gte('lng', lng - deltaLng)
          .lte('lng', lng + deltaLng)
          .limit(300);

        if (queryErr) throw queryErr;

        if (candidates && candidates.length > 0) {
          const R = 6371; // Earth radius in km

          // Helper to calculate Haversine distance
          const getDistance = (cLat: number, cLng: number) => {
            const dLat = ((cLat - lat) * Math.PI) / 180;
            const dLon = ((cLng - lng) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((cLat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dKm = R * c;
            return unit === 'miles' ? dKm * 0.621371 : dKm;
          };

          // Filter and map candidates
          const seen = new Set<string>();
          for (const item of candidates) {
            if (item.lat === null || item.lng === null) continue;
            
            const itemLat = Number(item.lat);
            const itemLng = Number(item.lng);
            const dist = getDistance(itemLat, itemLng);
            if (dist <= radiusVal && item.postal_code !== centerRow.postal_code) {
              // Deduplicate so we only show the closest place name for each code
              if (!seen.has(item.postal_code)) {
                seen.add(item.postal_code);
                results.push({
                  postal_code: item.postal_code,
                  place_name: item.place_name,
                  admin_name1: item.admin_name1,
                  distance: dist,
                  latitude: itemLat,
                  longitude: itemLng,
                });
              }
            }
          }

          // Sort ascending by distance
          results.sort((a, b) => a.distance - b.distance);
        }
      }
    } catch (err: any) {
      console.error(err);
      errorMsg = 'An error occurred while performing the radius search.';
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/tools/radius/`,
    isPartOf: { '@id': WEBSITE_ID },
    name: 'ZIP & Postal Code Radius Search Tool',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Radius Search' },
        ]}
      />

      <h1 className="mt-3 text-3xl font-bold text-ink">
        ZIP &amp; Postal Code Radius Search
      </h1>
      <p className="mt-2 text-muted">
        Find all nearby postal codes within a set distance radius of any zip code.
      </p>

      {/* Radius Search Form */}
      <section className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="postal_code" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Center Code
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              defaultValue={targetCode}
              required
              placeholder="e.g. 90210"
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="radius" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Radius Range
            </label>
            <select
              id="radius"
              name="radius"
              defaultValue={radiusVal}
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            >
              {[5, 10, 15, 25, 50, 100].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unit" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Distance Unit
            </label>
            <select
              id="unit"
              name="unit"
              defaultValue={unit}
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="km">Kilometers (km)</option>
              <option value="miles">Miles (mi)</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Country
            </label>
            <select
              id="country"
              name="country"
              defaultValue={country}
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            >
              {countriesList.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Find Nearby ZIP Codes
            </button>
          </div>
        </form>
      </section>

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Results Listing */}
      {center && (
        <section className="mt-6">
          <div className="rounded-xl border border-line bg-neutral-50 p-5">
            <span className="text-xs uppercase tracking-wider text-muted font-semibold block">Center Point:</span>
            <span className="mt-1 text-lg font-bold text-ink block">
              {center.postal_code} — {center.place_name}, {center.admin_name1 || ''} ({countryName(country)})
            </span>
            <span className="text-xs font-mono text-faint block">
              Coords: {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-ink">
              Found {results.length} Postal Codes within {radiusVal} {unit === 'miles' ? 'miles' : 'km'}
            </h2>

            {results.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No surrounding postal codes were found within the selected radius. Try expanding the search range.
              </p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white divide-y divide-line">
                {results.slice(0, 100).map((r, index) => (
                  <div key={r.postal_code} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 text-sm">
                    <div className="min-w-0">
                      <Link
                        href={`/directory/${country.toLowerCase()}/${encodeURIComponent(r.postal_code.toLowerCase())}/`}
                        className="font-bold text-accent hover:underline font-mono"
                      >
                        {r.postal_code}
                      </Link>
                      <span className="text-ink ml-2 font-medium truncate">
                        {r.place_name}
                      </span>
                      {r.admin_name1 && (
                        <span className="text-muted text-xs ml-1">· {r.admin_name1}</span>
                      )}
                    </div>
                    <div className="shrink-0 font-mono text-accent font-semibold ml-4">
                      {r.distance.toFixed(2)} {unit === 'miles' ? 'mi' : 'km'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Helpful Informational SEO Text */}
      <article className="mt-10 prose prose-neutral max-w-none text-ink leading-relaxed">
        <h2 className="text-xl font-bold">What is a Postal Code Radius Search?</h2>
        <p className="mt-2">
          A radius search allows you to identify all postal distribution points, ZIP codes, and municipal zones located within a circular boundary centered on a starting zip code. This tool is widely used by delivery networks, business dispatchers, marketing agencies, and local utility providers to scope coverage areas.
        </p>
        <p className="mt-2">
          The distances shown are straight-line measurements (as the crow flies) computed from the geographic coordinates of each zone's post office or population center.
        </p>
      </article>
    </main>
  );
}
