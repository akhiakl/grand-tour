"use client";

import { useEffect, useState } from "react";

import {
  createHistory,
  recordEdit,
  redoHistory,
  undoHistory,
  type DraftTrip,
} from "@/lib/trip";

/** True for Ctrl/Cmd+Z (undo), and Ctrl/Cmd+Shift+Z or Ctrl+Y (redo). */
function shortcut(event: KeyboardEvent): "undo" | "redo" | null {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return null;
  const key = event.key.toLowerCase();
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  if (key === "y" && event.ctrlKey) return "redo";
  return null;
}

/**
 * The editor's draft with undo/redo. `update` takes a transform and an
 * optional field group (rapid edits to one field coalesce into one step);
 * Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z work anywhere in the editor except
 * inside dialogs, which keep their own keyboard handling.
 */
export function useDraftHistory(initial: DraftTrip) {
  const [history, setHistory] = useState(() => createHistory(initial));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const action = shortcut(event);
      if (!action) return;
      if ((event.target as Element | null)?.closest?.('[role="dialog"]')) return;
      event.preventDefault();
      setHistory(action === "undo" ? undoHistory : redoHistory);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    draft: history.present,
    update: (fn: (draft: DraftTrip) => DraftTrip, group?: string) =>
      setHistory((h) => recordEdit(h, fn(h.present), group)),
    undo: () => setHistory(undoHistory),
    redo: () => setHistory(redoHistory),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
