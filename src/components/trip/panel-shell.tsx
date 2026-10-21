"use client";

import {
  animate,
  m,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";

import type { MapInsets } from "./fit-padding";

/** Mobile card floats this far above the bottom edge (`bottom-3`). */
const CARD_GAP = 12;

export const EASE_ATLAS = [0.32, 0.72, 0.24, 1] as const;
/** Drag distance (px) or flick speed (px/s) that commits a snap. */
const SNAP_DISTANCE = 48;
const SNAP_VELOCITY = 400;

/**
 * The trip panel's frame: one frosted "atlas card" floating over the
 * full-bleed map, top-left from `lg` up and along the bottom below it. The sheet rests showing just `head` and expands (handle click,
 * drag, or flick) to reveal `children`; `onInsetsChange` reports how much
 * of the screen it covers in either state, so the map aims above it.
 * On desktop the card is a fluid-width column (`--card-w`) that can
 * `collapse` to its head; the reported inset follows its measured edges.
 */
export function PanelShell({
  label,
  head,
  bodyId,
  expanded,
  onExpandedChange,
  collapsed,
  onInsetsChange,
  children,
}: {
  readonly label: string;
  readonly head: ReactNode;
  /** Lets the head's collapse toggle point `aria-controls` at the body. */
  readonly bodyId: string;
  readonly expanded: boolean;
  readonly onExpandedChange: (expanded: boolean) => void;
  /** Desktop only: the card is folded down to its head. */
  readonly collapsed: boolean;
  readonly onInsetsChange: (insets: MapInsets) => void;
  readonly children: ReactNode;
}) {
  const t = useTranslations("Trip.panel");
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [size, setSize] = useState({ sheet: 0, peek: 0, right: 0, headBottom: 0 });
  const collapsedY = Math.max(0, size.sheet - size.peek);
  const y = useMotionValue(0);
  const target = expanded ? 0 : collapsedY;

  const settle = (to: number) =>
    animate(
      y,
      to,
      reducedMotion ? { duration: 0 } : { duration: 0.45, ease: EASE_ATLAS },
    );

  useEffect(() => {
    const animation = settle(target);
    return () => animation.stop();
    // `settle` only closes over stable refs and the motion preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reducedMotion]);

  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const headEl = headRef.current;
    if (!sheet || !headEl) return;
    const observer = new ResizeObserver(() =>
      setSize({
        sheet: sheet.offsetHeight,
        peek: headEl.offsetTop + headEl.offsetHeight,
        // Desktop edges, in viewport px (the map fills the viewport).
        right: Math.round(sheet.getBoundingClientRect().right),
        headBottom: Math.round(headEl.getBoundingClientRect().bottom),
      }),
    );
    observer.observe(sheet);
    observer.observe(headEl);
    return () => observer.disconnect();
  }, []);

  // Collapsed, the card covers only a strip as tall as its head: measured
  // from the head (not the animating body) so the map re-fits once.
  const { sheet, peek, right, headBottom } = size;
  useEffect(() => {
    if (!isDesktop) onInsetsChange({ bottom: CARD_GAP + (expanded ? sheet : peek) });
    else if (collapsed) onInsetsChange({ top: headBottom });
    else onInsetsChange({ left: right });
  }, [
    isDesktop,
    expanded,
    collapsed,
    sheet,
    peek,
    right,
    headBottom,
    onInsetsChange,
  ]);

  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    const up = offset.y < -SNAP_DISTANCE || velocity.y < -SNAP_VELOCITY;
    const down = offset.y > SNAP_DISTANCE || velocity.y > SNAP_VELOCITY;
    let next = expanded;
    if (up) next = true;
    else if (down) next = false;
    // An unchanged snap won't re-run the effect, so settle back by hand.
    if (next === expanded) settle(target);
    else onExpandedChange(next);
  };

  return (
    <m.section
      ref={sheetRef}
      aria-label={label}
      drag={isDesktop ? false : "y"}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: collapsedY }}
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={onDragEnd}
      style={{ y }}
      className="atlas-card fixed inset-x-3 bottom-3 z-40 flex h-[60dvh] flex-col lg:inset-x-auto lg:top-5 lg:bottom-auto lg:left-5 lg:h-auto lg:max-h-[calc(100dvh-2.5rem)] lg:w-(--card-w) lg:transform-none!"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? t("collapseSheet") : t("expandSheet")}
        onPointerDown={(event) => dragControls.start(event)}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          onExpandedChange(!expanded);
        }}
        className="flex w-full shrink-0 touch-none justify-center pt-2.5 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset lg:hidden"
      >
        <span aria-hidden className="h-1 w-10 rounded-full bg-ink-soft/40" />
      </button>
      <div ref={headRef} className="shrink-0">
        {head}
      </div>
      <m.div
        id={bodyId}
        inert={isDesktop ? collapsed : !expanded}
        initial={false}
        animate={{ height: isDesktop && collapsed ? 0 : "auto" }}
        transition={
          reducedMotion ? { duration: 0 } : { duration: 0.4, ease: EASE_ATLAS }
        }
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:flex-initial"
      >
        {children}
      </m.div>
    </m.section>
  );
}
