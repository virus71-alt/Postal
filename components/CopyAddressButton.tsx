'use client';

import { useState } from 'react';

interface Props {
  postalCode: string;
  placeName: string;
  adminName1: string | null;
  adminName2: string | null;
  country: string;
  countryCode: string;
}

export default function CopyAddressButton({
  postalCode,
  placeName,
  adminName1,
  adminName2,
  country,
  countryCode
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let text = '';
    const cc = countryCode.toUpperCase();

    if (cc === 'IN') {
      text = `${placeName}\n${adminName2 ? adminName2 + ', ' : ''}${adminName1 || ''}\nIndia - ${postalCode}`;
    } else if (cc === 'US') {
      text = `${placeName}, ${adminName1 || ''} ${postalCode}\nUnited States`;
    } else if (cc === 'GB') {
      text = `${placeName}\n${adminName1 || ''}\nUnited Kingdom\n${postalCode}`;
    } else {
      text = `${placeName}\n${adminName1 ? adminName1 + ', ' : ''}${country}\n${postalCode}`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
        copied
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-white border-line text-muted hover:text-ink hover:bg-neutral-50'
      }`}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied Label!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Copy Mailing Label
        </>
      )}
    </button>
  );
}
