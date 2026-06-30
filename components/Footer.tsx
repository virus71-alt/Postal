import Link from 'next/link';
import Logo from '@/components/Logo';

// NOTE: the footer is intentionally country-INDEPENDENT (a single "Browse all
// countries" link instead of listing every country). Listing all countries here
// baked the full list into every page's HTML, so adding one country changed all
// pages and forced a full rebuild+reupload. Keeping it generic means existing
// pages stay byte-identical when a new country is added (incremental deploys).
// The full country grid lives on the homepage; all country URLs are in the sitemap.
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Logo markClass="h-8 w-8" />
          <p className="max-w-sm text-sm text-muted">
            A fast, free directory of postal &amp; ZIP codes worldwide — with
            places, districts, coordinates and maps.
          </p>
        </div>

        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            ['Browse all countries', '/'],
            ['About', '/about/'],
            ['Data & Methodology', '/methodology/'],
            ['Postal Code Guide', '/postal-code-guide/'],
            ['Contact', '/contact/'],
            ['Distance Calculator', '/tools/distance/'],
            ['Radius Search', '/tools/radius/'],
            ['Privacy Policy', '/privacy/'],
            ['Terms of Service', '/terms/'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-muted transition-colors hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="mt-10 border-t border-line pt-6 text-xs text-faint">
          © {new Date().getFullYear()} PostalAtlas. Map data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline hover:text-muted"
            rel="noopener noreferrer"
          >
            OpenStreetMap
          </a>{' '}
          contributors. Postal data is provided for informational purposes only.
        </p>
      </div>
    </footer>
  );
}
