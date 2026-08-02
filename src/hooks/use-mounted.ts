import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the client has mounted — the sanctioned way to gate
 * browser-only reads (localStorage, matchMedia) without a `setState` in a
 * mount effect, which trips `react-hooks/set-state-in-effect`.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
