import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Data & Methodology — Where PostalAtlas Data Comes From',
  description:
    'How PostalAtlas sources, structures, and presents postal code data, including data sources, attribution, update cadence, and known limitations.',
  alternates: { canonical: '/methodology/' },
};

export default function MethodologyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/methodology/`,
    isPartOf: { '@id': WEBSITE_ID },
    name: 'Data & Methodology',
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Data & Methodology' }]}
      />
      <h1 className="mt-3 text-3xl font-bold">Data &amp; Methodology</h1>
      <p className="mt-4 text-ink">
        Transparency about our data is core to how PostalAtlas works. This page
        explains where the information comes from, how each page is built, and
        what the data does and does not cover.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Data sources</h2>
      <p className="mt-2 text-ink">
        Postal code records are compiled from open geographical datasets,
        including the{' '}
        <a
          href="https://www.geonames.org/"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          GeoNames
        </a>{' '}
        postal-code database, which is published under the Creative Commons
        Attribution (CC BY) licence. Each record contributes a country, postal
        code, place name, administrative region, district, and latitude/longitude.
      </p>

      <h2 className="mt-8 text-xl font-semibold">How pages are built</h2>
      <p className="mt-2 text-ink">
        Records are grouped by postal code so a single page represents one code
        and lists every locality that shares it. Pages are generated statically
        and organised into a country → region → district → postal-code hierarchy
        for easy browsing and linking.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Coordinates</h2>
      <p className="mt-2 text-ink">
        Latitude and longitude are approximate centroids for the locality and
        are intended for orientation on the map, not for precise navigation or
        delivery routing.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Known limitations</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
        <li>Coverage and accuracy vary by country and source completeness.</li>
        <li>Some countries have no standardised postal-code system.</li>
        <li>Open datasets can lag behind official postal changes.</li>
        <li>Place names may use romanised or alternate spellings.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Attribution</h2>
      <p className="mt-2 text-ink">
        Postal data © GeoNames contributors (CC BY 4.0). Map tiles ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          OpenStreetMap
        </a>{' '}
        contributors. PostalAtlas is an independent project and is not
        affiliated with any national postal operator.
      </p>
    </main>
  );
}
