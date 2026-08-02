"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { searchCities, type CitySearchResult } from "@/lib/geo-search";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 500;

/**
 * Nominatim-backed city lookup: debounced input + a keyboard-operable
 * results listbox. Selecting a result hands the caller a prefilled city
 * shape; it does not touch the draft itself.
 */
export function CitySearch({
  onSelect,
  placeholder = "Search for a city…",
}: {
  readonly onSelect: (result: CitySearchResult) => void;
  readonly placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) return;

    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const found = await searchCities(query);
        if (id !== requestId.current) return;
        setResults(found);
        setOpen(true);
        setHighlighted(0);
      } catch {
        if (id !== requestId.current) return;
        setError(true);
        setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const select = (result: CitySearchResult) => {
    onSelect(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            if (next.trim().length < 2) {
              setResults([]);
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls="city-search-results"
          aria-autocomplete="list"
          className="pl-9"
          onKeyDown={(e) => {
            if (!open || results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlighted((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlighted((i) => (i - 1 + results.length) % results.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              select(results[highlighted]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (
        <ul
          id="city-search-results"
          role="listbox"
          className="frost absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-line p-1 shadow-soft"
        >
          {error && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Couldn&apos;t reach the map atlas — try again in a moment.
            </li>
          )}
          {!error && results.length === 0 && !loading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No cities found.
            </li>
          )}
          {results.map((result, index) => (
            <li key={`${result.name}-${result.ll.join(",")}`} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none",
                  index === highlighted && "bg-secondary",
                )}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => select(result)}
              >
                <MapPin className="size-4 shrink-0 text-brass" />
                <span className="flex-1 truncate">{result.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
