import { useSyncExternalStore } from "react";

let idle = false;
const listeners = new Set<() => void>();
let scheduled = false;

function markIdle() {
  idle = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  const whenIdle = () =>
    "requestIdleCallback" in window
      ? requestIdleCallback(markIdle, { timeout: 1500 })
      : setTimeout(markIdle, 200);
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

function subscribe(listener: () => void) {
  if (idle) return () => {};
  listeners.add(listener);
  schedule();
  return () => listeners.delete(listener);
}

/**
 * True once the page has loaded and the browser is idle, then for the
 * rest of the visit. Gates heavy client-only work (the map engine) so it
 * never competes with first paint and hydration on slow phones.
 */
export function usePageIdle(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => idle,
    () => false,
  );
}
