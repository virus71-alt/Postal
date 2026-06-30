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
  title: 'ZIP / Postal Code Distance Calculator — PostalAtlas',
  description: 'Calculate the straight-line distance (miles and kilometers) between any two ZIP or postal codes within the same country instantly.',
};

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    country?: string;
  }>;
}

export default async function DistancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const fromCode = (params.from || '').trim().toUpperCase();
  const toCode = (params.to || '').trim().toUpperCase();
  const country = (params.country || 'US').trim().toUpperCase();

  const countriesList = TARGET_COUNTRIES.map((code) => ({
    code,
    name: countryName(code),
  })).sort((a, b) => a.name.localeCompare(b.name));

  let errorMsg: string | null = null;
  let result: {
    from: any;
    to: any;
    km: number;
    miles: number;
  } | null = null;

  if (fromCode && toCode) {
    try {
      const [fromRes, toRes] = await Promise.all([
        supabase
          .from('postal_codes')
          .select('postal_code, place_name, admin_name1, latitude, longitude')
          .eq('country_code', country)
          .eq('postal_code', fromCode)
          .limit(1),
        supabase
          .from('postal_codes')
          .select('postal_code, place_name, admin_name1, latitude, longitude')
          .eq('country_code', country)
          .eq('postal_code', toCode)
          .limit(1),
      ]);

      const fromData = fromRes.data?.[0];
      const toData = toRes.data?.[0];

      if (!fromData) {
        errorMsg = `Postal code "${fromCode}" was not found in ${countryName(country)}.`;
      } else if (!toData) {
        errorMsg = `Postal code "${toCode}" was not found in ${countryName(country)}.`;
      } else if (
        fromData.latitude === null ||
        fromData.longitude === null ||
        toData.latitude === null ||
        toData.longitude === null
      ) {
        errorMsg = `Geographical coordinates are missing for one or both of these postal codes.`;
      } else {
        // Calculate Great-Circle distance via Haversine Formula
        const R = 6371; // Earth radius in km
        const lat1 = fromData.latitude;
        const lon1 = fromData.longitude;
        const lat2 = toData.latitude;
        const lon2 = toData.longitude;

        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = R * c;
        const distMiles = distKm * 0.621371;

        result = {
          from: fromData,
          to: toData,
          km: distKm,
          miles: distMiles,
        };
      }
    } catch (err: any) {
      console.error(err);
      errorMsg = 'An error occurred while calculating the distance.';
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/tools/distance/`,
    isPartOf: { '@id': WEBSITE_ID },
    name: 'ZIP / Postal Code Distance Calculator',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Distance Calculator' },
        ]}
      />

      <h1 className="mt-3 text-3xl font-bold text-ink">
        ZIP &amp; Postal Code Distance Calculator
      </h1>
      <p className="mt-2 text-muted">
        Enter two ZIP or postal codes within the same country to calculate the straight-line distance, coordinates, and view them.
      </p>

      {/* Calculator Form */}
      <section className="mt-6 rounded-xl border border-line bg-white p-6 shadow-sm">
        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="from" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Start Postal Code
            </label>
            <input
              type="text"
              id="from"
              name="from"
              defaultValue={fromCode}
              required
              placeholder="e.g. 90210"
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="to" className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Destination Code
            </label>
            <input
              type="text"
              id="to"
              name="to"
              defaultValue={toCode}
              required
              placeholder="e.g. 10001"
              className="mt-1 w-full rounded-lg border border-line bg-neutral-50 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
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

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Calculate Distance
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

      {/* Calculation Result */}
      {result && (
        <section className="mt-6 rounded-xl border border-line bg-neutral-50 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Distance Results
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-center sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4 border border-line">
              <span className="block text-xs font-medium text-muted uppercase">Miles</span>
              <span className="mt-1 block text-3xl font-bold text-accent font-mono">
                {result.miles.toFixed(2)} mi
              </span>
            </div>
            <div className="rounded-lg bg-white p-4 border border-line">
              <span className="block text-xs font-medium text-muted uppercase">Kilometers</span>
              <span className="mt-1 block text-3xl font-bold text-accent font-mono">
                {result.km.toFixed(2)} km
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-sm font-semibold text-ink">Route Details</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 border border-line">
                <span className="block font-semibold text-muted text-xs uppercase">From:</span>
                <span className="mt-1 block font-bold text-ink">
                  {result.from.postal_code} — {result.from.place_name}
                </span>
                <span className="text-xs text-muted block mt-1">
                  Region: {result.from.admin_name1 || '—'}
                </span>
                <span className="text-xs font-mono text-faint block">
                  Coords: {result.from.latitude.toFixed(4)}, {result.from.longitude.toFixed(4)}
                </span>
              </div>

              <div className="rounded-lg bg-white p-4 border border-line">
                <span className="block font-semibold text-muted text-xs uppercase">To:</span>
                <span className="mt-1 block font-bold text-ink">
                  {result.to.postal_code} — {result.to.place_name}
                </span>
                <span className="text-xs text-muted block mt-1">
                  Region: {result.to.admin_name1 || '—'}
                </span>
                <span className="text-xs font-mono text-faint block">
                  Coords: {result.to.latitude.toFixed(4)}, {result.to.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Helpful Informational SEO Text */}
      <article className="mt-10 prose prose-neutral max-w-none text-ink leading-relaxed">
        <h2 className="text-xl font-bold">About ZIP Code Distance Calculations</h2>
        <p className="mt-2">
          This distance calculator finds the straight-line (geodesic) distance between two postal zones based on their average geographic center coordinates. We calculate these distances using the Haversine formula, which computes the shortest distance between two points on the surface of a sphere.
        </p>
        <p className="mt-2">
          Please note that straight-line distance is often referred to as "as the crow flies." This distance represents the absolute shortest separation between coordinates and does not correspond to driving distance, road travel coordinates, or delivery times which are dependent on road layouts, highway routes, and traffic conditions.
        </p>
      </article>
    </main>
  );
}
