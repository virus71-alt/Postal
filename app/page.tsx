import Link from 'next/link';
import SearchBox from '@/components/SearchBox';
import JsonLd from '@/components/JsonLd';
import { TARGET_COUNTRIES } from '@/config/buildConfig';
import { COUNTRY_STATS } from '@/config/countryStats';
import { countryName } from '@/lib/postalData';
import { countryFlag } from '@/lib/flag';

export const dynamic = 'force-dynamic';

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://postalatlas.com').replace(
  /\/$/,
  ''
);

const FEATURES = [
  {
    title: 'Search by place or code',
    body: 'Type a city, town or postal code — instant, typo-friendly results.',
  },
  {
    title: 'Maps & coordinates',
    body: 'Every code shows its exact location on a lightweight map.',
  },
  {
    title: 'Fast & free',
    body: 'A static, ad-supported directory — no sign-up, no clutter.',
  },
];

export default function HomePage() {
  const stats = COUNTRY_STATS;
  const countries = TARGET_COUNTRIES.map((code) => ({
    code,
    name: countryName(code),
    ...(stats[code] ?? { pins: 0, places: 0, states: 0 }),
  })).sort((a, b) => a.name.localeCompare(b.name));

  const totalPins = countries.reduce((n, c) => n + c.pins, 0);
  const totalPlaces = countries.reduce((n, c) => n + c.places, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PostalAtlas — Global Postal & ZIP Code Directory',
    url: `${SITE}/`,
    isPartOf: { '@id': `${SITE}/#website` },
    description: `A free directory of ${totalPins.toLocaleString()} postal and ZIP codes across ${countries.length} countries, with places, regions, coordinates and maps.`,
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <section className="relative z-20 mx-auto max-w-3xl px-4 pt-20 pb-10 text-center sm:pt-28">
        <p className="text-sm font-medium text-muted">
          {countries.length} countries · {totalPins.toLocaleString()} codes
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
          Find any postal code,
          <br className="hidden sm:block" /> instantly.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          Search {totalPins.toLocaleString()} postal codes covering{' '}
          {totalPlaces.toLocaleString()} places — with regions, districts,
          coordinates and maps.
        </p>
        <div className="mt-8 flex justify-center">
          <SearchBox size="large" />
        </div>
        <p className="mt-3 text-xs text-faint">
          Try “New York”, “Tokyo”, or a code like 110001
        </p>
      </section>

      <section className="relative z-10 mx-auto max-w-2xl px-4">
        <div className="grid grid-cols-3 border-y border-line">
          {[
            [countries.length.toLocaleString(), 'Countries'],
            [totalPins.toLocaleString(), 'Postal Codes'],
            [totalPlaces.toLocaleString(), 'Places'],
          ].map(([value, label], i) => (
            <div
              key={label}
              className={`px-2 py-6 text-center ${i > 0 ? 'border-l border-line' : ''}`}
            >
              <p className="text-lg font-semibold text-ink tabular-nums sm:text-2xl">
                {value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-faint sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pt-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Browse by country
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {countries.map((c) => (
            <Link
              key={c.code}
              href={`/directory/${c.code.toLowerCase()}/`}
              className="group flex items-center gap-4 border-b border-line py-4 transition-colors hover:bg-neutral-50 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-6 sm:[&:nth-child(even)]:pl-6"
            >
              <span className="text-xl leading-none" aria-hidden="true">
                {countryFlag(c.code)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-ink group-hover:text-accent">
                  {c.name}
                </span>
                <span className="block text-xs text-faint">
                  {c.pins.toLocaleString()} codes · {c.states} regions
                </span>
              </span>
              <span className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
