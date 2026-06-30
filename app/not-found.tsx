import Link from 'next/link';
import { TARGET_COUNTRIES } from '@/config/buildConfig';
import { countryName } from '@/lib/postalData';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="font-mono text-6xl font-extrabold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
        We couldn’t find that page
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        If you were looking for a postal code, it may not be in our directory
        yet. Try the search above, or browse by country:
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent-dark"
        >
          Go to Homepage
        </Link>
        {TARGET_COUNTRIES.map((code) => (
          <Link
            key={code}
            href={`/directory/${code.toLowerCase()}/`}
            className="rounded-xl border border-line bg-white px-5 py-2.5 font-semibold text-ink transition hover:border-ink/20 hover:text-accent"
          >
            Browse {countryName(code)}
          </Link>
        ))}
      </div>
    </main>
  );
}
