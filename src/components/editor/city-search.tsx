"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchCities } from "@/lib/geo-search";
import type { CitySearchResult } from "@/lib/geo-search";

export function CitySearch({
  onSelect,
  disabled,
}: {
  readonly onSelect: (result: CitySearchResult) => void;
  readonly disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounced.trim().length < 2) return;

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const found = await searchCities(debounced, { signal: controller.signal });
        setResults(found);
        setOpen(true);
      } catch {
        // ignored — a stale/aborted request or a transient network error
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debounced]);

  const visibleResults = debounced.trim().length >= 2 ? results : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (result: CitySearchResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={disabled ? "Guest limit reached" : "Add a city…"}
          disabled={disabled}
          className="pl-9"
          aria-label="Search for a city to add"
        />
        {loading && (
          <Loader2
            aria-hidden
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </div>

      {open && visibleResults.length > 0 && (
        <ul className="frost absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg p-1">
          {visibleResults.map((result) => (
            <li key={`${result.name}|${result.country}`}>
              <button
                type="button"
                onClick={() => select(result)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent"
              >
                <MapPin aria-hidden className="size-4 shrink-0 text-brass" />
                <span>
                  {result.flag} {result.name}
                  <span className="text-muted-foreground"> · {result.country}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
