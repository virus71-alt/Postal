import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, ORG_ID, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'About PostalAtlas — What We Do & Who It’s For',
  description:
    'PostalAtlas is a free, global directory of postal and ZIP codes built from open data. Learn what the site covers, who it serves, and how it works.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: `${SITE}/about/`,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    name: 'About PostalAtlas',
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
      <h1 className="mt-3 text-3xl font-bold">About PostalAtlas</h1>

      <p className="mt-4 text-ink">
        PostalAtlas is a free, independent directory of postal and ZIP codes
        from around the world. Every postal code has its own page showing the
        place name, administrative region (state or province), district, all
        localities that share the code, GPS coordinates, and a map.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What PostalAtlas does</h2>
      <p className="mt-2 text-ink">
        We turn open postal datasets into fast, readable reference pages so
        anyone can look up a postal code by place name or by the code itself.
        The directory currently covers 34 countries and is expanding.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Who it’s for</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
        <li>People filling in addresses, forms, and shipping labels.</li>
        <li>Shoppers and senders verifying a destination postal code.</li>
        <li>Developers and researchers needing a quick human-readable lookup.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">How it works</h2>
      <p className="mt-2 text-ink">
        PostalAtlas is a fast, dynamic web directory — pages are rendered on the
        fly from a high-performance database, keeping listings updated and accurate.
        Data is compiled from open sources; see our{' '}
        <Link href="/methodology/" className="text-accent hover:underline">
          data &amp; methodology
        </Link>{' '}
        page for details on where the information comes from and its limits.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Accuracy &amp; corrections</h2>
      <p className="mt-2 text-ink">
        Postal data changes over time and open datasets can contain gaps or
        errors. We provide this information for general reference only — always
        confirm critical mail with your national postal operator. Spotted a
        mistake? Reach us via the{' '}
        <Link href="/contact/" className="text-accent hover:underline">
          contact page
        </Link>
        .
      </p>
    </main>
  );
}
