import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VectorBasemap } from "./vector-basemap";

const mocks = vi.hoisted(() => {
  const handlers = new Map<string, () => void>();
  const basemap = {
    on: vi.fn((event: string, handler: () => void) => handlers.set(event, handler)),
    off: vi.fn((event: string) => handlers.delete(event)),
    setStyle: vi.fn(),
  };
  const layer = {
    addTo: vi.fn(),
    remove: vi.fn(),
    getMaplibreMap: () => basemap,
  };
  const leafletMap = {
    attributionControl: { addAttribution: vi.fn(), removeAttribution: vi.fn() },
  };
  return {
    handlers,
    basemap,
    layer,
    leafletMap,
    maplibreGL: vi.fn(() => layer),
    toast: { error: vi.fn(), dismiss: vi.fn() },
  };
});

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("./maplibre", () => ({}));
vi.mock("@maplibre/maplibre-gl-leaflet", () => ({ maplibreGL: mocks.maplibreGL }));
vi.mock("react-leaflet", () => ({ useMap: () => mocks.leafletMap }));
vi.mock("sonner", () => ({ toast: mocks.toast }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.handlers.clear();
});

describe("VectorBasemap", () => {
  it("adds the MapLibre layer with its attribution", () => {
    render(<VectorBasemap />);

    expect(mocks.layer.addTo).toHaveBeenCalledWith(mocks.leafletMap);
    expect(mocks.leafletMap.attributionControl.addAttribution).toHaveBeenCalled();
    expect(mocks.toast.error).not.toHaveBeenCalled();
  });

  it("shows one retryable toast when the basemap fails to load", () => {
    render(<VectorBasemap />);

    mocks.handlers.get("error")?.();
    mocks.handlers.get("error")?.();

    expect(mocks.toast.error).toHaveBeenCalledTimes(2);
    const ids = mocks.toast.error.mock.calls.map(([, options]) => options.id);
    expect(new Set(ids).size).toBe(1);

    mocks.toast.error.mock.calls[0][1].action.onClick();
    expect(mocks.basemap.setStyle).toHaveBeenCalledTimes(1);
  });

  it("cleans up the layer, listener and toast on unmount", () => {
    const { unmount } = render(<VectorBasemap />);

    unmount();

    expect(mocks.basemap.off).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mocks.toast.dismiss).toHaveBeenCalled();
    expect(mocks.leafletMap.attributionControl.removeAttribution).toHaveBeenCalled();
    expect(mocks.layer.remove).toHaveBeenCalled();
  });
});
