import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { SITE, WEBSITE_ID } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Privacy Policy — PostalAtlas',
  description: 'Learn about how PostalAtlas collects, uses, and safeguards your information, including cookies and Google AdSense policies.',
  alternates: { canonical: '/privacy/' },
};

export default function PrivacyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: `${SITE}/privacy/`,
    isPartOf: { '@id': WEBSITE_ID },
    name: 'Privacy Policy',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <h1 className="mt-3 text-3xl font-bold">Privacy Policy</h1>

      <p className="mt-4 text-ink">
        At PostalAtlas, accessible from {SITE}, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by PostalAtlas and how we use it.
      </p>

      <h2 className="mt-8 text-xl font-semibold">1. Log Files</h2>
      <p className="mt-2 text-ink">
        PostalAtlas follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
      </p>

      <h2 className="mt-8 text-xl font-semibold">2. Cookies and Web Beacons</h2>
      <p className="mt-2 text-ink">
        Like any other website, PostalAtlas uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
      </p>

      <h2 className="mt-8 text-xl font-semibold">3. Google DoubleClick DART Cookie</h2>
      <p className="mt-2 text-ink">
        Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">4. Advertising Partners Privacy Policies</h2>
      <p className="mt-2 text-ink">
        Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on PostalAtlas, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
      </p>
      <p className="mt-2 text-ink">
        Note that PostalAtlas has no access to or control over these cookies that are used by third-party advertisers.
      </p>

      <h2 className="mt-8 text-xl font-semibold">5. Third Party Privacy Policies</h2>
      <p className="mt-2 text-ink">
        PostalAtlas's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
      </p>
      <p className="mt-2 text-ink">
        You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
      </p>

      <h2 className="mt-8 text-xl font-semibold">6. Children's Information</h2>
      <p className="mt-2 text-ink">
        Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
      </p>
      <p className="mt-2 text-ink">
        PostalAtlas does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
      </p>

      <h2 className="mt-8 text-xl font-semibold">7. Consent</h2>
      <p className="mt-2 text-ink">
        By using our website, you hereby consent to our Privacy Policy and agree to its terms.
      </p>

      <h2 className="mt-8 text-xl font-semibold">8. Contact Us</h2>
      <p className="mt-2 text-ink">
        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:contact@postalatlas.com" className="text-accent hover:underline">contact@postalatlas.com</a>.
      </p>
    </main>
  );
}
