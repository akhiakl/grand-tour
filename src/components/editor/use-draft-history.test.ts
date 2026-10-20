import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createBlankDraft, updateTitle } from "@/lib/trip";

import { useDraftHistory } from "./use-draft-history";

const press = (init: KeyboardEventInit) =>
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
  });

describe("useDraftHistory", () => {
  it("undoes and redoes with buttons and keyboard shortcuts", async () => {
    const { result } = renderHook(() => useDraftHistory(createBlankDraft()));
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.update((d) => updateTitle(d, "Alps")));
    expect(result.current.draft.title).toBe("Alps");
    expect(result.current.canUndo).toBe(true);

    await press({ key: "z", ctrlKey: true });
    expect(result.current.draft.title).toBe("Grand Tour");
    expect(result.current.canRedo).toBe(true);

    await press({ key: "Z", metaKey: true, shiftKey: true });
    expect(result.current.draft.title).toBe("Alps");

    act(() => result.current.undo());
    await press({ key: "y", ctrlKey: true });
    expect(result.current.draft.title).toBe("Alps");

    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.draft.title).toBe("Alps");
  });

  it("ignores plain keys and shortcuts typed inside a dialog", async () => {
    const { result } = renderHook(() => useDraftHistory(createBlankDraft()));
    act(() => result.current.update((d) => updateTitle(d, "Alps")));

    await press({ key: "z" });
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.appendChild(dialog);
    act(() => {
      dialog.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }),
      );
    });
    dialog.remove();

    expect(result.current.draft.title).toBe("Alps");
  });
});
