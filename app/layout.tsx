import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { siteGraph } from '@/lib/seo';
import Script from 'next/script';
import './globals.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://postalatlas.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'PostalAtlas — Global Postal & ZIP Code Directory',
    template: '%s | PostalAtlas',
  },
  description:
    'Look up postal and ZIP codes worldwide with place names, states, districts, GPS coordinates and maps.',
  applicationName: 'PostalAtlas',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'PostalAtlas',
    title: 'PostalAtlas — Global Postal & ZIP Code Directory',
    description:
      'Look up postal and ZIP codes worldwide with place names, regions, coordinates and maps.',
    url: SITE,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'PostalAtlas — Global Postal & ZIP Code Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PostalAtlas — Global Postal & ZIP Code Directory',
    description:
      'Look up postal and ZIP codes worldwide with place names, regions, coordinates and maps.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-71BZ6BGF71"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-71BZ6BGF71');
          `}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col bg-white text-ink antialiased">
        <JsonLd data={siteGraph} />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
