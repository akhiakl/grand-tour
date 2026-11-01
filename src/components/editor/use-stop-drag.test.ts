import { act, renderHook } from "@testing-library/react";
import type { DragEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { useStopDrag } from "./use-stop-drag";

const dragEvent = () =>
  ({ preventDefault: vi.fn() }) as unknown as DragEvent<HTMLDivElement>;

describe("useStopDrag", () => {
  it("only lets a row drag while its grip is held", () => {
    const { result } = renderHook(() => useStopDrag(vi.fn()));
    expect(result.current.rowProps(1).draggable).toBe(false);

    act(() => result.current.gripProps(1).onPointerDown());
    expect(result.current.rowProps(1).draggable).toBe(true);
    expect(result.current.rowProps(0).draggable).toBe(false);

    act(() => result.current.gripProps(1).onPointerUp());
    expect(result.current.rowProps(1).draggable).toBe(false);
  });

  it("shows where the stop would land and moves it on drop", () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useStopDrag(onMove));

    act(() => result.current.rowProps(0).onDragStart());
    act(() => result.current.rowProps(2).onDragOver(dragEvent()));
    expect(result.current.dropSide(2)).toBe("after");
    expect(result.current.dropSide(1)).toBeNull();

    act(() => result.current.rowProps(2).onDrop(dragEvent()));
    expect(onMove).toHaveBeenCalledWith(0, 2);
    expect(result.current.dragged).toBeNull();
    expect(result.current.dropSide(2)).toBeNull();
  });

  it("lands before the hovered stop when moving up, and ignores drops on itself", () => {
    const onMove = vi.fn();
    const { result } = renderHook(() => useStopDrag(onMove));

    act(() => result.current.rowProps(2).onDragStart());
    act(() => result.current.rowProps(0).onDragOver(dragEvent()));
    expect(result.current.dropSide(0)).toBe("before");

    act(() => result.current.rowProps(2).onDrop(dragEvent()));
    expect(onMove).not.toHaveBeenCalled();
  });

  it("ignores drag-overs that didn't start in the list", () => {
    const { result } = renderHook(() => useStopDrag(vi.fn()));
    const event = dragEvent();
    act(() => result.current.rowProps(1).onDragOver(event));
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(result.current.dropSide(1)).toBeNull();
  });
});
