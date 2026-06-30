'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  size?: 'large' | 'compact';
}

type Country = { code: string; name: string };

// [place_name, postal_code, state, boost]
type NameEntry = [string, string, string, number?];

export default function SearchBox({ size = 'compact' }: Props) {
  const [countries, setCountries] = useState<Country[]>([
    { code: 'IN', name: 'India' },
  ]);
  const [country, setCountry] = useState('IN');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pinSuggestions, setPinSuggestions] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<NameEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/countries.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Country[]) => {
        if (Array.isArray(list) && list.length) {
          setCountries(list);
          setCountry((c) => (list.some((x) => x.code === c) ? c : list[0].code));
        }
      })
      .catch(() => {});
  }, []);

  // Honour ?q= so the WebSite SearchAction (sitelinks search box) resolves to a
  // real, prefilled search instead of a dead URL.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      setCode(q);
      setOpen(true);
    }
  }, []);

  // Fetch search suggestions dynamically from the server API
  useEffect(() => {
    const raw = code.trim();
    if (!open || raw.length < 2) {
      setPinSuggestions([]);
      setNameSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?country=${country}&q=${encodeURIComponent(raw)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : { pins: [], names: [] }))
        .then((data) => {
          setPinSuggestions(data.pins || []);
          setNameSuggestions(data.names || []);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setLoading(false);
          }
        });
    }, 150);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [country, code, open]);

  const cc = country.toLowerCase();
  const countryLabel =
    countries.find((c) => c.code === country)?.name ?? country;

  const raw = code.trim();
  const digitLed = /^\d/.test(raw);
  const pinQuery = raw.replace(/\s+/g, '').toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function go(pin: string) {
    window.location.href = `/directory/${cc}/${encodeURIComponent(pin.toLowerCase())}/`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!raw) return;

    const exactPin = pinSuggestions.find(
      (p) => p.replace(/\s+/g, '').toUpperCase() === pinQuery
    );
    if (exactPin) return go(exactPin);

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?country=${country}&q=${encodeURIComponent(raw)}`
      );
      if (res.ok) {
        const data = await res.json();
        const pins: string[] = data.pins || [];
        const names: NameEntry[] = data.names || [];

        const exact = pins.find(
          (p) => p.replace(/\s+/g, '').toUpperCase() === pinQuery
        );
        if (exact) return go(exact);

        const total = pins.length + names.length;
        if (total === 1) {
          return go(pins[0] ?? names[0][1]);
        }
        if (total === 0) {
          setError(
            digitLed
              ? `Postal code “${pinQuery}” is not in our ${countryLabel} directory.`
              : `No place or postal code matching “${raw}” found in ${countryLabel}.`
          );
        } else {
          setPinSuggestions(pins);
          setNameSuggestions(names);
          setOpen(true);
        }
      } else {
        go(pinQuery);
      }
    } catch {
      go(pinQuery);
    } finally {
      setLoading(false);
    }
  }

  const nameRow = ([name, pin, state]: NameEntry) => (
    <button
      key={`n|${name}|${pin}`}
      type="button"
      onClick={() => go(pin)}
      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
    >
      <span className="truncate text-ink">
        <span className="font-medium">{name}</span>
        {state && <span className="text-faint">, {state}</span>}
      </span>
      <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-semibold text-accent">
        {pin}
      </span>
    </button>
  );

  const pinRow = (p: string) => (
    <button
      key={`p|${p}`}
      type="button"
      onClick={() => go(p)}
      className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-neutral-50"
    >
      <span className="font-mono font-semibold text-accent">{p}</span>
      <span className="text-faint"> — {countryLabel}</span>
    </button>
  );

  const large = size === 'large';
  const showDropdown =
    open && (error || pinSuggestions.length > 0 || nameSuggestions.length > 0);

  return (
    <div
      ref={boxRef}
      className={`relative w-full ${large ? 'max-w-xl' : 'max-w-md'}`}
    >
      <form
        onSubmit={onSubmit}
        className={`flex flex-col sm:flex-row w-full overflow-hidden rounded-lg border border-line bg-white transition focus-within:border-ink/30 focus-within:ring-1 focus-within:ring-ink/10 ${
          large ? 'text-base' : 'text-sm'
        }`}
      >
        <select
          aria-label="Country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setError(null);
            setPinSuggestions([]);
            setNameSuggestions([]);
          }}
          className={`w-full sm:w-[140px] shrink-0 border-b sm:border-b-0 sm:border-r border-line bg-neutral-50 font-medium text-muted outline-none ${
            large ? 'px-3 py-3 sm:py-3.5' : 'px-2 py-2'
          }`}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search place or PIN code…"
          value={code}
          onFocus={() => {
            setOpen(true);
          }}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
            setOpen(true);
          }}
          className={`w-full sm:w-auto sm:flex-1 min-w-0 border-b sm:border-b-0 border-line text-ink outline-none placeholder:text-faint ${
            large ? 'px-4 py-3 sm:py-3.5' : 'px-3 py-2'
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto bg-accent font-semibold text-white transition-colors hover:bg-accent-dark ${
            large ? 'px-6 py-3 sm:py-0' : 'px-4 py-2 sm:py-0'
          } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[60vh] overflow-auto rounded-lg border border-line bg-white text-left shadow-lg ring-1 ring-black/5">
          {error && (
            <p className="px-4 py-3 text-sm text-red-600">
              {error}{' '}
              <a
                href={`/directory/${cc}/`}
                className="font-medium text-accent hover:underline"
              >
                Browse {countryLabel} →
              </a>
            </p>
          )}
          {digitLed
            ? [...pinSuggestions.map(pinRow), ...nameSuggestions.map(nameRow)]
            : [...nameSuggestions.map(nameRow), ...pinSuggestions.map(pinRow)]}
        </div>
      )}
    </div>
  );
}
