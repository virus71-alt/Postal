import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'What Is a Postal Code? A Plain-English Guide',
  description:
    'A clear guide to postal codes: what they are, how they differ from ZIP and PIN codes, how to find one, and answers to common questions.',
  alternates: { canonical: '/postal-code-guide/' },
};

const FAQS = [
  {
    q: 'What is a postal code?',
    a: 'A postal code is a series of letters and/or digits added to a postal address to help sort and deliver mail. It identifies a delivery area such as a town, district, or group of streets.',
  },
  {
    q: 'What is the difference between a postal code, a ZIP code, and a PIN code?',
    a: 'They are the same idea under different national names. “ZIP code” is the United States term, “PIN code” (Postal Index Number) is used in India, and “postal code” or “postcode” is used in most other countries.',
  },
  {
    q: 'How do I find the postal code for a place?',
    a: 'Search the place name or the code itself on PostalAtlas. Each result shows the postal code, its region and district, the localities it covers, and a map.',
  },
  {
    q: 'Can one postal code cover more than one place?',
    a: 'Yes. In many countries a single postal code covers several neighbouring localities or villages, especially in rural areas. PostalAtlas lists every locality that shares a code.',
  },
  {
    q: 'Do all countries use postal codes?',
    a: 'No. Most countries use a postal-code system, but a few — including Ireland’s older addressing and several Gulf and Caribbean nations — historically did not, or use them inconsistently.',
  },
  {
    q: 'Why does my postal code matter when shopping online?',
    a: 'Retailers and couriers use the postal code to calculate shipping, estimate delivery times, and route parcels to the correct sorting centre, so an accurate code helps avoid delays.',
  },
];

export default function PostalCodeGuidePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'What Is a Postal Code? A Plain-English Guide',
      url: `${SITE}/postal-code-guide/`,
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
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
        items={[{ label: 'Home', href: '/' }, { label: 'Postal Code Guide' }]}
      />
      <h1 className="mt-3 text-3xl font-bold">What Is a Postal Code?</h1>
      <p className="mt-4 text-ink">
        A <strong>postal code</strong> is a short string of letters and/or
        numbers added to the end of a postal address. It tells the postal
        service which delivery area an address belongs to, making sorting and
        delivery faster and more accurate. Depending on the country, the same
        concept is called a <strong>ZIP code</strong> (United States), a{' '}
        <strong>PIN code</strong> (India), or a <strong>postcode</strong> (UK,
        Australia and many others).
      </p>

      <h2 className="mt-8 text-xl font-semibold">What a postal code tells you</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
        <li>The broad region or city the address sits in.</li>
        <li>The local district or delivery zone within that region.</li>
        <li>Often, a small cluster of streets or a single large building.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">How to find a postal code</h2>
      <p className="mt-2 text-ink">
        Use the search box at the top of any PostalAtlas page. You can type a{' '}
        <strong>place name</strong> (like “Tokyo” or “New York”) or the{' '}
        <strong>code itself</strong>. Each result page lists the region,
        district, every locality under that code, GPS coordinates, and a map.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Frequently Asked Questions</h2>
      <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
        {FAQS.map((f) => (
          <div key={f.q} className="px-4 py-4">
            <h3 className="font-semibold text-ink">{f.q}</h3>
            <p className="mt-1 text-muted">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
