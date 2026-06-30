import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStateStatsForCountry, countryName } from '@/lib/postalData';
import { slugify } from '@/lib/slug';
import AdUnit from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

interface PageParams {
  country_code: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { country_code } = await params;
  const states = await getStateStatsForCountry(country_code);
  if (states.length === 0) return {};
  const name = countryName(country_code);
  const pinCount = states.reduce((sum, s) => sum + s.pin_count, 0);
  return {
    title: `${name} Postal Codes by State — Full Directory`,
    description: `Browse all ${pinCount.toLocaleString()} ${name} postal codes organised by state and district, with places, coordinates and maps.`,
    alternates: { canonical: `/directory/${country_code.toLowerCase()}/` },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { country_code } = await params;
  const states = await getStateStatsForCountry(country_code);
  if (states.length === 0) notFound();
  
  const name = countryName(country_code);
  const pinCount = states.reduce((sum, s) => sum + s.pin_count, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: name }]}
      />

      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
        {name} Postal Codes by State
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        {pinCount.toLocaleString()} postal codes across{' '}
        {states.length} states and union territories. Choose a state to
        browse its districts and PIN codes.
      </p>

      <p className="mt-4 max-w-3xl text-sm text-ink leading-relaxed">
        Welcome to the official geographical directory for <strong>{name}</strong>. Here you will find structured access to the entire country's postal systems, indexing a total of <strong>{pinCount.toLocaleString()}</strong> unique postal and ZIP code zones. By organizing our data across <strong>{states.length}</strong> main states, provinces, or territories, we make it simple to track down administrative details and regional structures. Browse the regional list below to begin locating codes, counties, and municipal districts.
      </p>

      {/* AD PLACEMENT 1 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} className="my-6" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {states.map((state) => {
          const stateSlug = slugify(state.state_name);
          return (
            <Link
              key={stateSlug}
              href={`/browse/${country_code.toLowerCase()}/${stateSlug}/`}
              className="group rounded-xl border border-line bg-white p-4 transition hover:border-ink/20"
            >
              <h2 className="font-semibold group-hover:text-accent">
                {state.state_name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {state.district_count} districts ·{' '}
                {state.pin_count.toLocaleString()} PIN codes
              </p>
            </Link>
          );
        })}
      </div>

      {/* AD PLACEMENT 2 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} className="mt-10" />
    </main>
  );
}
