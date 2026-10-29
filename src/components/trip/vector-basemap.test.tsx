import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VectorBasemap } from "./vector-basemap";

const mocks = vi.hoisted(() => {
  const handlers = new Map<string, () => void>();
  const basemap = {
    on: vi.fn((event: string, handler: () => void) => handlers.set(event, handler)),
    off: vi.fn((event: string) => handlers.delete(event)),
    setStyle: vi.fn(),
    isStyleLoaded: vi.fn(() => false),
    getStyle: () => ({ layers: [{ id: "poi_r1", type: "symbol" }] }),
    setLayoutProperty: vi.fn(),
    setPaintProperty: vi.fn(),
  };
  const layer: {
    addTo: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    getMaplibreMap: ReturnType<typeof vi.fn>;
    onRemove?: () => void;
    _container?: HTMLElement;
  } = {
    addTo: vi.fn(),
    remove: vi.fn(),
    getMaplibreMap: vi.fn(() => basemap),
  };
  const leafletMap = {
    attributionControl: { addAttribution: vi.fn(), removeAttribution: vi.fn() },
    // Mirrors Leaflet: removing a loaded layer calls its onRemove.
    removeLayer: vi.fn((removed: { onRemove?: () => void }) => removed.onRemove?.()),
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
  mocks.basemap.isStyleLoaded.mockReturnValue(false);
  mocks.handlers.clear();
  mocks.layer.addTo.mockImplementation(() => undefined);
  mocks.layer.getMaplibreMap.mockImplementation(() => mocks.basemap);
  delete mocks.layer.onRemove;
  delete mocks.layer._container;
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

  it("ignores per-tile errors once the style has loaded", () => {
    mocks.basemap.isStyleLoaded.mockReturnValue(true);
    render(<VectorBasemap />);

    mocks.handlers.get("error")?.();

    expect(mocks.toast.error).not.toHaveBeenCalled();
  });

  it("dismisses the toast once the style loads after a retry", () => {
    render(<VectorBasemap />);

    mocks.handlers.get("error")?.();
    mocks.handlers.get("style.load")?.();
    expect(mocks.basemap.setLayoutProperty).toHaveBeenCalledWith(
      "poi_r1",
      "visibility",
      "none",
    );

    expect(mocks.toast.dismiss).toHaveBeenCalledWith(
      mocks.toast.error.mock.calls[0][1].id,
    );
  });

  it("cleans up the layer, listener and toast on unmount", () => {
    const { unmount } = render(<VectorBasemap />);

    unmount();

    expect(mocks.basemap.off).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mocks.basemap.off).toHaveBeenCalledWith(
      "style.load",
      expect.any(Function),
    );
    expect(mocks.toast.dismiss).toHaveBeenCalled();
    expect(mocks.leafletMap.attributionControl.removeAttribution).toHaveBeenCalled();
    expect(mocks.layer.remove).toHaveBeenCalled();
  });

  describe("when MapLibre can't start (e.g. no WebGL2)", () => {
    beforeEach(() => {
      mocks.layer.addTo.mockImplementation(() => {
        throw new Error("WebGL2 is required to display this map.");
      });
    });

    it("renders without throwing and unregisters the broken layer safely", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      mocks.layer._container = container;

      expect(() => render(<VectorBasemap />)).not.toThrow();

      expect(mocks.leafletMap.removeLayer).toHaveBeenCalledWith(mocks.layer);
      expect(container.isConnected).toBe(false);
      expect(() => mocks.layer.onRemove?.()).not.toThrow();
      expect(mocks.leafletMap.attributionControl.addAttribution).not.toHaveBeenCalled();
    });

    it("shows the offline toast without a retry action", () => {
      render(<VectorBasemap />);

      expect(mocks.toast.error).toHaveBeenCalledTimes(1);
      const [, options] = mocks.toast.error.mock.calls[0];
      expect(options.action).toBeUndefined();
    });

    it("treats a missing MapLibre map as a failed start", () => {
      mocks.layer.addTo.mockImplementation(() => undefined);
      mocks.layer.getMaplibreMap.mockReturnValue(undefined);

      render(<VectorBasemap />);

      expect(mocks.leafletMap.removeLayer).toHaveBeenCalledWith(mocks.layer);
      expect(mocks.toast.error).toHaveBeenCalledTimes(1);
    });

    it("only dismisses the toast on unmount", () => {
      const { unmount } = render(<VectorBasemap />);

      unmount();

      expect(mocks.toast.dismiss).toHaveBeenCalled();
      expect(mocks.layer.remove).not.toHaveBeenCalled();
      expect(mocks.basemap.off).not.toHaveBeenCalled();
    });
  });
});
