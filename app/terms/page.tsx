import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Terms of Service — PostalAtlas',
  description: 'Read the terms of service governing the use of the PostalAtlas website and directory services.',
  alternates: { canonical: '/terms/' },
};

export default function TermsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/terms/`,
    isPartOf: { '@id': WEBSITE_ID },
    name: 'Terms of Service',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
      <h1 className="mt-3 text-3xl font-bold">Terms of Service</h1>

      <p className="mt-4 text-ink">
        Welcome to PostalAtlas. These terms and conditions outline the rules and regulations for the use of PostalAtlas's Website, located at {SITE}.
      </p>

      <p className="mt-2 text-ink">
        By accessing this website we assume you accept these terms and conditions. Do not continue to use PostalAtlas if you do not agree to take all of the terms and conditions stated on this page.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Disclaimer of Warranties</h2>
      <p className="mt-2 text-ink">
        The postal data, maps, coordinates, and boundaries provided on PostalAtlas are compiled from public and open-source datasets. They are provided solely for informational and general reference purposes.
      </p>
      <p className="mt-2 text-ink">
        We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, data, or maps on this website. Any reliance you place on such information is strictly at your own risk.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Limitation of Liability</h2>
      <p className="mt-2 text-ink">
        In no event will PostalAtlas, its operators, or contributors be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. License & Acceptable Use</h2>
      <p className="mt-2 text-ink">
        Unless otherwise stated, PostalAtlas owns the intellectual property rights for all code, design, layouts, and brand assets. All intellectual property rights are reserved. You may access this for your own personal use subjected to restrictions set in these terms and conditions.
      </p>
      <p className="mt-2 text-ink">
        You must not:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
        <li>Republish entire portions of the database or mass-scrape the directory.</li>
        <li>Sell, rent, or sub-license materials or code from PostalAtlas.</li>
        <li>Reproduce, duplicate, or copy code and brand designs from PostalAtlas.</li>
        <li>Use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the dynamic search API.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">4. Third-Party Links & Services</h2>
      <p className="mt-2 text-ink">
        This website contains links to other websites and mapping services (e.g. OpenStreetMap). These links are provided for your convenience to provide further information. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Termination</h2>
      <p className="mt-2 text-ink">
        We reserve the right to restrict or terminate access to our dynamic search features or page routing if we detect automated scraping, DDOS attempts, or malicious traffic violating these terms.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Changes to Terms</h2>
      <p className="mt-2 text-ink">
        PostalAtlas reserves the right to revise these terms and conditions at any time. By using this website, you are expected to review these terms on a regular basis to ensure you understand all terms and conditions governing the use of this website.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Contact Information</h2>
      <p className="mt-2 text-ink">
        If you have any queries regarding any of our terms, please contact us at <a href="mailto:contact@postalatlas.com" className="text-accent hover:underline">contact@postalatlas.com</a>.
      </p>
    </main>
  );
}
