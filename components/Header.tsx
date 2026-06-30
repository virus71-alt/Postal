'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBox from '@/components/SearchBox';
import Logo from '@/components/Logo';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="relative sm:sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        {!isHome && <SearchBox />}
      </div>
    </header>
  );
}
