"use client";

import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/use-media-query";

const EASE_ATLAS = [0.32, 0.72, 0.24, 1] as const;
/** Drag distance (px) or flick speed (px/s) that commits a snap. */
const SNAP_DISTANCE = 48;
const SNAP_VELOCITY = 400;

/**
 * The trip panel's frame: a docked sidebar from `lg` up, a bottom sheet
 * below it. The sheet rests showing just `head` and expands (handle click,
 * drag, or flick) to reveal `children`; `onInsetChange` reports how much
 * of the screen it covers in either state, so the map aims above it.
 */
export function PanelShell({
  label,
  head,
  expanded,
  onExpandedChange,
  onInsetChange,
  children,
}: {
  readonly label: string;
  readonly head: ReactNode;
  readonly expanded: boolean;
  readonly onExpandedChange: (expanded: boolean) => void;
  readonly onInsetChange: (px: number) => void;
  readonly children: ReactNode;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [size, setSize] = useState({ sheet: 0, peek: 0 });
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
      }),
    );
    observer.observe(sheet);
    observer.observe(headEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onInsetChange(expanded ? size.sheet : size.peek);
  }, [expanded, size, onInsetChange]);

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
    <motion.section
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
      className="fixed inset-x-0 bottom-0 z-40 flex h-[60dvh] flex-col rounded-t-[22px] border-t border-line bg-paper shadow-soft lg:static lg:z-auto lg:h-full lg:transform-none! lg:rounded-none lg:border-t-0 lg:border-r lg:shadow-none"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse trip details" : "Expand trip details"}
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
      <div
        inert={!isDesktop && !expanded}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {children}
      </div>
    </motion.section>
  );
}
