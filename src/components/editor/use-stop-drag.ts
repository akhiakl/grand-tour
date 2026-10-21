"use client";

import { useState, type DragEvent } from "react";

export type DropSide = "before" | "after" | null;

/**
 * Drag-to-reorder for the stop list. A row only becomes draggable while
 * its grip is held, so selecting text in its inputs never starts a drag,
 * and the hovered row reports which side the dragged stop would land on.
 * Keyboard users reorder with the row's move buttons instead.
 */
export function useStopDrag(onMove: (from: number, to: number) => void) {
  const [armed, setArmed] = useState<number | null>(null);
  const [dragged, setDragged] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const reset = () => {
    setArmed(null);
    setDragged(null);
    setOver(null);
  };

  const rowProps = (index: number) => ({
    draggable: armed === index,
    onDragStart: () => setDragged(index),
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (dragged === null) return;
      event.preventDefault();
      setOver(index);
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (dragged !== null && dragged !== index) onMove(dragged, index);
      reset();
    },
    onDragEnd: reset,
  });

  const gripProps = (index: number) => ({
    onPointerDown: () => setArmed(index),
    onPointerUp: () => setArmed(null),
  });

  // The dragged stop takes the hovered stop's place, so it lands after it
  // when moving down the list and before it when moving up.
  const dropSide = (index: number): DropSide => {
    if (dragged === null || over !== index || dragged === index) return null;
    return dragged < index ? "after" : "before";
  };

  return { dragged, rowProps, gripProps, dropSide };
}
