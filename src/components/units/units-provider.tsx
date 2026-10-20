"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  BASE_CURRENCY,
  DEFAULT_PREFS,
  defaultPrefs,
  formatDistance,
  formatMoney,
  parsePrefs,
  RatesSchema,
  type DisplayPrefs,
  type Rates,
} from "@/lib/units";

const STORAGE_KEY = "prefs:display";
const CHANGE_EVENT = "prefs:display-change";

/** "unavailable" means amounts are showing in USD because rates failed. */
export type RatesStatus = "not-needed" | "loading" | "ready" | "unavailable";

export interface Units {
  prefs: DisplayPrefs;
  setPrefs: (prefs: DisplayPrefs) => void;
  /** A USD amount or [low, high] range in the viewer's currency. */
  money: (usd: number | readonly [number, number]) => string;
  /** A km distance in the viewer's unit. */
  distance: (km: number) => string;
  ratesStatus: RatesStatus;
}

const FALLBACK: Units = {
  prefs: DEFAULT_PREFS,
  setPrefs: () => {},
  money: (usd) => formatMoney(usd, BASE_CURRENCY, null),
  distance: (km) => formatDistance(km, DEFAULT_PREFS.distance),
  ratesStatus: "not-needed",
};

const UnitsContext = createContext<Units>(FALLBACK);

/** The viewer's units and currency; plain USD/km outside a provider. */
export function useUnits(): Units {
  return useContext(UnitsContext);
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

let snapshot: { raw: string | null; prefs: DisplayPrefs } | null = null;

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Cached per stored value so useSyncExternalStore sees a stable object. */
function getSnapshot(): DisplayPrefs {
  const raw = readStored();
  if (snapshot?.raw !== raw || !snapshot) {
    snapshot = { raw, prefs: parsePrefs(raw) ?? defaultPrefs(navigator.language) };
  }
  return snapshot.prefs;
}

const getServerSnapshot = () => DEFAULT_PREFS;

function savePrefs(prefs: DisplayPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode: the choice lasts for this page only.
    snapshot = { raw: JSON.stringify(prefs), prefs };
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

let ratesRequest: Promise<Rates | null> | null = null;

/** One `/api/rates` request per page load; a failure may be retried later. */
function loadRates(): Promise<Rates | null> {
  ratesRequest ??= fetch("/api/rates")
    .then((response) => (response.ok ? response.json() : null))
    .then((body) => {
      const parsed = RatesSchema.safeParse(body);
      return parsed.success ? parsed.data : null;
    })
    .catch(() => null)
    .then((rates) => {
      if (!rates) ratesRequest = null;
      return rates;
    });
  return ratesRequest;
}

/**
 * Holds the viewer's display prefs (localStorage, defaulting from the
 * browser locale) and fetches live rates only once a non-USD currency is
 * chosen. Trips are never changed: this is presentation only.
 */
export function UnitsProvider({ children }: { readonly children: ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const needsRates = prefs.currency !== BASE_CURRENCY;
  const [rates, setRates] = useState<Rates | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!needsRates || rates) return;
    let live = true;
    void loadRates().then((loaded) => {
      if (!live) return;
      if (loaded) setRates(loaded);
      else setFailed(true);
    });
    return () => {
      live = false;
    };
  }, [needsRates, rates]);

  const value = useMemo<Units>(() => {
    let ratesStatus: RatesStatus = "not-needed";
    if (needsRates && rates) ratesStatus = "ready";
    else if (needsRates) ratesStatus = failed ? "unavailable" : "loading";
    return {
      prefs,
      setPrefs: savePrefs,
      money: (usd) => formatMoney(usd, prefs.currency, rates),
      distance: (km) => formatDistance(km, prefs.distance),
      ratesStatus,
    };
  }, [prefs, needsRates, rates, failed]);

  return <UnitsContext value={value}>{children}</UnitsContext>;
}
