import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createHistory,
  pushHistory,
  recordEdit,
  redoHistory,
  undoHistory,
} from "./history";

afterEach(() => {
  vi.useRealTimers();
});

describe("history", () => {
  it("undoes and redoes discrete edits", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b", 0);
    h = pushHistory(h, "c", 10);
    h = undoHistory(h);
    expect(h.present).toBe("b");
    h = undoHistory(h);
    expect(h.present).toBe("a");
    expect(undoHistory(h)).toBe(h);

    h = redoHistory(h);
    expect(h.present).toBe("b");
    h = redoHistory(redoHistory(h));
    expect(h.present).toBe("c");
    expect(redoHistory(h)).toBe(h);
  });

  it("coalesces rapid edits to the same field into one step", () => {
    let h = createHistory("");
    h = pushHistory(h, "P", 0, "title");
    h = pushHistory(h, "Pa", 200, "title");
    h = pushHistory(h, "Par", 400, "title");
    expect(undoHistory(h).present).toBe("");

    // A pause, or another field, starts a new step.
    h = pushHistory(h, "Paris", 2000, "title");
    expect(undoHistory(h).present).toBe("Par");
    h = pushHistory(h, "Paris!", 2100, "other");
    expect(undoHistory(h).present).toBe("Paris");
  });

  it("drops the redo branch on a new edit and ignores no-op edits", () => {
    let h = pushHistory(createHistory("a"), "b", 0);
    h = undoHistory(h);
    h = pushHistory(h, "c", 10);
    expect(h.future).toEqual([]);
    expect(pushHistory(h, h.present, 20)).toBe(h);
  });

  it("keeps at most 100 undo steps", () => {
    let h = createHistory(0);
    for (let i = 1; i <= 150; i++) h = pushHistory(h, i, i * 5000);
    expect(h.past).toHaveLength(100);
    expect(h.past[0]).toBe(50);
  });

  it("recordEdit stamps edits with the clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let h = recordEdit(createHistory("a"), "ab", "title");
    vi.setSystemTime(500);
    h = recordEdit(h, "abc", "title");
    expect(undoHistory(h).present).toBe("a");
  });
});
