'use client';

import { useEffect, useRef } from 'react';

interface Props {
  slot: string | undefined;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdUnit({ slot, style, className = 'my-6' }: Props) {
  const initialized = useRef(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client || !slot || typeof window === 'undefined') return;

    try {
      if (!initialized.current) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        initialized.current = true;
      }
    } catch (err) {
      console.error('[AdSense] Error pushing ad:', err);
    }
  }, [client, slot]);

  const isDev = process.env.NODE_ENV === 'development';
  if (!client || !slot) {
    if (isDev) {
      return (
        <div className={`flex h-24 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-xs font-semibold text-neutral-400 ${className}`}>
          Ad Placeholder (AdSense Client/Slot ID Missing)
        </div>
      );
    }
    return null;
  }

  return (
    <div className={className} style={{ minHeight: '90px', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
