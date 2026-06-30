import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStateBySlug, getDistrictStatsForState, countryName } from '@/lib/postalData';
import { slugify } from '@/lib/slug';
import AdUnit from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

interface PageParams {
  country_code: string;
  state: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { country_code, state: stateSlug } = await params;
  const state = await getStateBySlug(country_code, stateSlug);
  if (!state) return {};
  const cName = countryName(country_code);
  return {
    title: `${state.state_name} Postal Codes — All Districts in ${state.state_name}, ${cName}`,
    description: `Browse ${state.pin_count.toLocaleString()} postal codes in ${state.state_name}, ${cName}, organised across ${state.district_count} districts.`,
    alternates: {
      canonical: `/browse/${country_code.toLowerCase()}/${stateSlug}/`,
    },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { country_code, state: stateSlug } = await params;
  const state = await getStateBySlug(country_code, stateSlug);
  if (!state) notFound();

  const cName = countryName(country_code);
  const country = { code: country_code.toUpperCase(), name: cName };
  const districtsData = await getDistrictStatsForState(country_code, state.state_name);

  const cc = country.code.toLowerCase();
  
  const stateObj = {
    name: state.state_name,
    slug: stateSlug,
    pinCount: state.pin_count,
    placeCount: state.place_count,
    districts: districtsData.map((d) => ({
      name: d.district_name,
      slug: slugify(d.district_name),
      pinsCount: d.pin_count,
    })),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: country.name, href: `/directory/${cc}/` },
          { label: stateObj.name },
        ]}
      />

      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
        {stateObj.name} Postal Codes
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        {stateObj.pinCount.toLocaleString()} PIN codes covering{' '}
        {stateObj.placeCount.toLocaleString()} places in {stateObj.name},{' '}
        {country.name}. Pick a district to see its postal codes.
      </p>

      {/* AD PLACEMENT 1 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} className="my-6" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stateObj.districts.map((district) => (
          <Link
            key={district.slug}
            href={`/browse/${cc}/${stateObj.slug}/${district.slug}/`}
            className="group rounded-xl border border-line bg-white p-4 transition hover:border-ink/20"
          >
            <h2 className="font-semibold group-hover:text-accent">
              {district.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {district.pinsCount.toLocaleString()} PIN codes
            </p>
          </Link>
        ))}
      </div>

      {/* AD PLACEMENT 2 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} className="mt-10" />
    </main>
  );
}
