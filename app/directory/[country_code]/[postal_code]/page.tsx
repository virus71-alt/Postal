import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { getPostalEntry, getPinsForDistrict, countryName } from '@/lib/postalData';
import { slugify } from '@/lib/slug';
import { supabase } from '@/lib/supabase';
import AdUnit from '@/components/AdUnit';
import CopyAddressButton from '@/components/CopyAddressButton';
import TimezoneClock from '@/components/TimezoneClock';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://postalatlas.com').replace(
  /\/$/,
  ''
);

export const dynamic = 'force-dynamic';

interface PageParams {
  country_code: string;
  postal_code: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { country_code, postal_code } = await params;
  const entry = await getPostalEntry(country_code, postal_code);
  if (!entry) return {};
  const primary = entry.places[0];
  const country = countryName(entry.country_code);
  return {
    title: `${entry.postal_code} Postal Code — ${primary.place_name}, ${primary.admin_name1}, ${country}`,
    description: `Postal code ${entry.postal_code} covers ${primary.place_name} in ${primary.admin_name1}, ${country}. View the district, all ${entry.places.length} localities under this code, GPS coordinates and map.`,
    alternates: {
      canonical: `/directory/${country_code.toLowerCase()}/${postal_code.toLowerCase()}/`,
    },
  };
}

export default async function PostalCodePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { country_code, postal_code } = await params;
  const entry = await getPostalEntry(country_code, postal_code);
  if (!entry) notFound();

  const primary = entry.places[0];
  const country = countryName(entry.country_code);
  const cc = entry.country_code.toLowerCase();

  const stateName = primary.admin_name1?.trim() || 'Other';
  const districtName = primary.admin_name2?.trim() || 'Other';
  const stateSlug = slugify(stateName);
  const districtSlug = slugify(districtName);

  // Dynamic fetch of PINs in the same district
  const districtPins = await getPinsForDistrict(entry.country_code, stateName, districtName);

  const state = {
    name: stateName,
    slug: stateSlug,
  };

  const district = {
    name: districtName,
    slug: districtSlug,
    pins: districtPins,
  };

  // Query geographically closest postal codes using coordinates
  let nearby: any[] = [];
  if (hasCoords) {
    try {
      const delta = 0.15; // ~15km bounding box
      const { data: geoData } = await supabase
        .from('postal_codes')
        .select('postal_code, place_name, latitude, longitude')
        .eq('country_code', entry.country_code)
        .neq('postal_code', entry.postal_code)
        .gte('latitude', lat - delta)
        .lte('latitude', lat + delta)
        .gte('longitude', lng - delta)
        .lte('longitude', lng + delta)
        .limit(30);

      if (geoData && geoData.length > 0) {
        const getDistSq = (p: any) => {
          const dLat = (p.latitude || 0) - lat;
          const dLng = (p.longitude || 0) - lng;
          return dLat * dLat + dLng * dLng;
        };
        geoData.sort((a, b) => getDistSq(a) - getDistSq(b));

        const seen = new Set<string>();
        for (const item of geoData) {
          if (!seen.has(item.postal_code)) {
            seen.add(item.postal_code);
            nearby.push({
              postal_code: item.postal_code,
              primaryPlace: item.place_name,
            });
            if (nearby.length >= 8) break;
          }
        }
      }
    } catch (err) {
      console.error('[Nearby Codes] Error fetching:', err);
    }
  }

  // Fallback to district list if coordinates missing or query yields no results
  if (nearby.length === 0) {
    const idx = districtPins.findIndex((p) => p.postal_code === entry.postal_code);
    nearby = districtPins
      .slice(Math.max(0, idx - 4), idx + 5)
      .filter((p) => p.postal_code !== entry.postal_code)
      .slice(0, 8)
      .map((p) => ({
        postal_code: p.postal_code,
        primaryPlace: p.primaryPlace,
      }));
  }

  const lat = Number(primary.lat);
  const lng = Number(primary.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const d = 0.04; // ~4km bounding box
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(lng - d).toFixed(4)},${(lat - d).toFixed(4)},${(lng + d).toFixed(4)},${(lat + d).toFixed(4)}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`
    : null;

  const region = primary.admin_name1?.trim();
  const coordText = hasCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : null;

  const directAnswer =
    `The postal code for ${primary.place_name}` +
    (region ? `, ${region}` : '') +
    `, ${country} is ${entry.postal_code}.` +
    (districtName ? ` ${primary.place_name} lies in ${districtName} district.` : '') +
    (coordText ? ` Its geographic coordinates are ${coordText}.` : '') +
    (entry.places.length > 1
      ? ` This code covers ${entry.places.length} localities.`
      : '');

  const faqs: { q: string; a: string }[] = [
    {
      q: `What is the postal code of ${primary.place_name}, ${country}?`,
      a: `The postal code (PIN/ZIP) for ${primary.place_name}${region ? `, ${region}` : ''}, ${country} is ${entry.postal_code}.`,
    },
    {
      q: `Where is postal code ${entry.postal_code} located?`,
      a: `${entry.postal_code} is in ${primary.place_name}${districtName ? `, ${districtName} district` : ''}${region ? `, ${region}` : ''}, ${country}${coordText ? ` (coordinates ${coordText})` : ''}.`,
    },
  ];
  if (entry.places.length > 1) {
    faqs.push({
      q: `How many areas use the ${entry.postal_code} postal code?`,
      a: `${entry.places.length} localities share the ${entry.postal_code} postal code, including ${entry.places
        .slice(0, 4)
        .map((p) => p.place_name)
        .join(', ')}.`,
    });
  }
  if (coordText) {
    faqs.push({
      q: `What are the GPS coordinates of ${primary.place_name}?`,
      a: `${primary.place_name} is located at latitude ${lat.toFixed(4)}, longitude ${lng.toFixed(4)}.`,
    });
  }

  const pageUrl = `${SITE}/directory/${cc}/${encodeURIComponent(entry.postal_code.toLowerCase())}/`;
  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: `${primary.place_name} (${entry.postal_code})`,
      address: {
        '@type': 'PostalAddress',
        postalCode: entry.postal_code,
        addressLocality: primary.place_name,
        ...(region ? { addressRegion: region } : {}),
        addressCountry: entry.country_code,
      },
      ...(hasCoords
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: lat,
              longitude: lng,
            },
          }
        : {}),
      ...(region
        ? {
            containedInPlace: {
              '@type': 'AdministrativeArea',
              name: region,
              ...(districtName
                ? { containsPlace: { '@type': 'AdministrativeArea', name: districtName } }
                : {}),
              containedInPlace: {
                '@type': 'Country',
                name: country,
                identifier: entry.country_code,
              },
            },
          }
        : {}),
      url: pageUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      isPartOf: { '@id': `${SITE}/#website` },
      dateModified: new Date().toISOString(),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '#direct-answer'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: 'Home', url: `${SITE}/` },
        { name: country, url: `${SITE}/directory/${cc}/` },
        ...(state ? [{ name: state.name, url: `${SITE}/browse/${cc}/${state.slug}/` }] : []),
        ...(state && district
          ? [{ name: district.name, url: `${SITE}/browse/${cc}/${state.slug}/${district.slug}/` }]
          : []),
        { name: entry.postal_code, url: pageUrl },
      ].map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: it.url,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: country, href: `/directory/${cc}/` },
          ...(state
            ? [{ label: state.name, href: `/browse/${cc}/${state.slug}/` }]
            : []),
          ...(state && district
            ? [
                {
                  label: district.name,
                  href: `/browse/${cc}/${state.slug}/${district.slug}/`,
                },
              ]
            : []),
          { label: entry.postal_code },
        ]}
      />

      <header className="mt-4">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
          Postal Code for {primary.place_name}, {primary.admin_name1},{' '}
          {entry.country_code}
        </h1>
        <p id="direct-answer" className="mt-3 text-muted">{directAnswer}</p>
      </header>

      <p className="mt-4 text-sm text-ink leading-relaxed">
        This reference page provides detailed geographical and administrative statistics for postal code <strong>{entry.postal_code}</strong>, which primarily routes to the locality of <strong>{primary.place_name}</strong>. Mapped within the region of <strong>{primary.admin_name1 ?? 'N/A'}</strong>{primary.admin_name2 ? <> (specifically inside the <strong>{primary.admin_name2}</strong> district)</> : null} in <strong>{country}</strong>, this routing zone plays a vital role in local logistics, mail delivery coordination, and location verification services. Below you will find specific coordinate mappings, a list of all associated areas sharing this postal code, and an interactive map view for navigation.
      </p>

      {/* AD PLACEMENT 1 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} className="my-6" />

      <section className="rounded-xl border border-line bg-neutral-50 px-6 py-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-faint">
          Postal / PIN Code
        </p>
        <p className="mt-3 break-all font-mono text-6xl font-semibold tracking-tight text-ink sm:text-7xl">
          {entry.postal_code}
        </p>
        <p className="mt-3 text-sm text-muted">
          {primary.place_name}, {country}
        </p>
        <CopyAddressButton
          postalCode={entry.postal_code}
          placeName={primary.place_name}
          adminName1={primary.admin_name1}
          adminName2={primary.admin_name2}
          country={country}
          countryCode={entry.country_code}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Location Details</h2>
        <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Place</dt>
            <dd className="text-right font-medium">{primary.place_name}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">State / Province</dt>
            <dd className="text-right font-medium">
              {primary.admin_name1 ?? '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">District / County</dt>
            <dd className="text-right font-medium">
              {primary.admin_name2 ?? '—'}
            </dd>
          </div>
          {primary.admin_name3 && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Area</dt>
              <dd className="text-right font-medium">{primary.admin_name3}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Country</dt>
            <dd className="text-right font-medium">
              {country} ({entry.country_code})
            </dd>
          </div>
          {hasCoords && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Coordinates</dt>
              <dd className="text-right font-medium tabular-nums">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {entry.places.length > 1 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            All {entry.places.length} Localities Under {entry.postal_code}
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {entry.places.map((p, i) => (
              <li
                key={`${p.place_name}-${i}`}
                className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium">{p.place_name}</span>
                {p.admin_name2 && (
                  <span className="text-muted"> · {p.admin_name2}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasCoords && (
        <TimezoneClock longitude={lng} />
      )}

      {mapSrc && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            Map of {primary.place_name}
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-line">
            <iframe
              src={mapSrc}
              title={`Map of ${primary.place_name}, ${country} (${entry.postal_code})`}
              className="h-72 w-full sm:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mt-2 text-xs text-faint">
            Map data ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              className="underline"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </a>{' '}
            contributors
          </p>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">
            Geographically Nearby Postal Codes
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {nearby.map((p) => (
              <li key={p.postal_code}>
                <Link
                  href={`/directory/${cc}/${p.postal_code.toLowerCase()}/`}
                  className="block rounded-lg border border-line bg-white px-3 py-2 text-center transition-colors hover:border-ink/20 hover:bg-neutral-50"
                >
                  <span className="block font-mono text-sm font-semibold text-accent">
                    {p.postal_code}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {p.primaryPlace}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <Link
              href={`/browse/${cc}/${state.slug}/${district.slug}/`}
              className="font-medium text-accent hover:underline"
            >
              View all {district.pins.length} PIN codes in {district.name} →
            </Link>
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Frequently Asked Questions
        </h2>
        <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
          {faqs.map((f) => (
            <div key={f.q} className="px-4 py-3">
              <h3 className="font-medium text-ink">{f.q}</h3>
              <p className="mt-1 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AD PLACEMENT 2 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} className="mt-10" />
    </main>
  );
}
