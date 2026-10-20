import { useCallback, useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint: the atlas card moves to the top-left from here. */
export const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Live `matchMedia` result. Reads false on the server and during
 * hydration, so layout must not depend on it for first paint: use it for
 * behaviour (inert, insets), and CSS breakpoints for appearance.
 */
export function useMediaQuery(query: string): boolean {
  // Stable per query, so React doesn't resubscribe on every render.
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
