import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getStateBySlug, getDistrictBySlug, getPinsForDistrict, countryName } from '@/lib/postalData';
import AdUnit from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

interface PageParams {
  country_code: string;
  state: string;
  district: string;
}

async function load(params: Promise<PageParams>) {
  const { country_code, state: stateSlug, district: districtSlug } = await params;
  const cName = countryName(country_code);
  const country = { code: country_code.toUpperCase(), name: cName };
  
  const stateData = await getStateBySlug(country_code, stateSlug);
  if (!stateData) return { country, state: null, district: null };
  
  const districtData = await getDistrictBySlug(country_code, stateData.state_name, districtSlug);
  if (!districtData) return { country, state: null, district: null };

  const pins = await getPinsForDistrict(country_code, stateData.state_name, districtData.district_name);

  return {
    country,
    state: { name: stateData.state_name, slug: stateSlug },
    district: {
      name: districtData.district_name,
      slug: districtSlug,
      pins,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { country, state, district } = await load(params);
  if (!country || !state || !district) return {};
  return {
    title: `${district.name} PIN Codes — ${state.name}, ${country.name}`,
    description: `Complete list of ${district.pins.length} postal codes in ${district.name} district, ${state.name}, ${country.name}, with the main place for each PIN.`,
    alternates: {
      canonical: `/browse/${country.code.toLowerCase()}/${state.slug}/${district.slug}/`,
    },
  };
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { country, state, district } = await load(params);
  if (!country || !state || !district) notFound();

  const cc = country.code.toLowerCase();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: country.name, href: `/directory/${cc}/` },
          { label: state.name, href: `/browse/${cc}/${state.slug}/` },
          { label: district.name },
        ]}
      />

      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
        {district.name} PIN Codes
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        All {district.pins.length.toLocaleString()} postal codes in{' '}
        {district.name} district, {state.name}, {country.name}.
      </p>

      {/* AD PLACEMENT 1 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP} className="my-6" />

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {district.pins.map((pin) => (
          <li key={pin.postal_code}>
            <Link
              href={`/directory/${cc}/${pin.postal_code.toLowerCase()}/`}
              className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2.5 transition hover:border-ink/20"
            >
              <span className="truncate text-sm text-muted">
                {pin.primaryPlace}
                {pin.placeCount > 1 && (
                  <span className="text-faint"> +{pin.placeCount - 1}</span>
                )}
              </span>
              <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-sm font-semibold text-accent group-hover:bg-accent group-hover:text-white">
                {pin.postal_code}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* AD PLACEMENT 2 */}
      <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM} className="mt-10" />
    </main>
  );
}
