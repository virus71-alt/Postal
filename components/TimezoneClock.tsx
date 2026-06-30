'use client';

import { useEffect, useState } from 'react';

interface Props {
  longitude: number;
}

export default function TimezoneClock({ longitude }: Props) {
  const offsetHours = Math.round(longitude / 15);
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utcTime + offsetHours * 3600000);

      setTimeStr(
        localTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [offsetHours]);

  const offsetDisplay = offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`;

  if (!timeStr) {
    return (
      <div className="mt-8 rounded-xl border border-line bg-white p-5">
        <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div>
        <div className="h-8 w-48 bg-neutral-100 rounded mt-2 animate-pulse"></div>
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        Estimated Local Time
      </h2>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <span className="font-mono text-3xl font-bold text-ink tracking-tight">
          {timeStr}
        </span>
        <span className="text-sm font-medium text-muted bg-neutral-50 px-2.5 py-1 rounded-md border border-line">
          Solar Zone: UTC {offsetDisplay}
        </span>
      </div>
      <p className="mt-2 text-xs text-faint leading-relaxed">
        *Estimated solar time based on coordinates ({longitude.toFixed(2)}° Longitude). Legal timezone may vary.
      </p>
    </section>
  );
}
