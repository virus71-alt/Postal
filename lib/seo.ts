// Central entity definitions for Entity SEO / GEO. Every page references the
// same Organization and WebSite via stable @id values so search engines and AI
// systems resolve one consistent entity (knowledge-graph clarity).
export const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://postalatlas.com'
).replace(/\/$/, '');

export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

// Official external profiles. Add real, verified URLs here as they go live —
// never fabricate. sameAs is what links the entity to the wider knowledge graph.
export const SAME_AS: string[] = [];

export const organizationSchema = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'PostalAtlas',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/icon.svg` },
  description:
    'PostalAtlas is a free directory of postal and ZIP codes worldwide, with place names, administrative regions, districts, coordinates and maps, compiled from open postal datasets.',
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'PostalAtlas',
  url: `${SITE}/`,
  publisher: { '@id': ORG_ID },
  // Sitelinks search box: the homepage reads ?q= and runs the search client-side.
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Sitewide entity graph rendered on every page via the root layout.
export const siteGraph = {
  '@context': 'https://schema.org',
  '@graph': [organizationSchema, websiteSchema],
};
