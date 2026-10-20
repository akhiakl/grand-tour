import { useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint: the trip panel docks as a sidebar from here. */
export const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Live `matchMedia` result. Reads false on the server and during
 * hydration, so layout must not depend on it for first paint: use it for
 * behaviour (inert, insets), and CSS breakpoints for appearance.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
