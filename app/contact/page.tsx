import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, ORG_ID, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

const CONTACT_EMAIL = 'contact@postalatlas.com';

export const metadata: Metadata = {
  title: 'Contact PostalAtlas',
  description:
    'Get in touch with PostalAtlas to report a data error, suggest a country, or ask a question.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE}/contact/`,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    name: 'Contact PostalAtlas',
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <h1 className="mt-3 text-3xl font-bold">Contact</h1>
      <p className="mt-4 text-ink">
        Found an error in a postal code, want a country added, or have a
        question about the data? We’d like to hear from you.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-white p-5">
        <p className="text-sm text-muted">Email</p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-lg font-semibold text-accent hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
      <p className="mt-4 text-sm text-muted">
        When reporting a data issue, please include the postal code and country
        so we can locate the record quickly.
      </p>
    </main>
  );
}
