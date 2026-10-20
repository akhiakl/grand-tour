import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRates } from "@/test/fixtures/units";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Fresh module per test: the provider caches prefs and rates per page. */
async function renderProbe(language = "en-IE") {
  vi.spyOn(navigator, "language", "get").mockReturnValue(language);
  const { UnitsProvider, useUnits } = await import("./units-provider");
  let units!: ReturnType<typeof useUnits>;
  function Probe() {
    units = useUnits();
    return (
      <p>
        {units.money([100, 200])} | {units.distance(1520)} | {units.ratesStatus}
      </p>
    );
  }
  render(
    <UnitsProvider>
      <Probe />
    </UnitsProvider>,
  );
  return () => units;
}

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe("UnitsProvider", () => {
  it("defaults from the browser locale and converts with live rates", async () => {
    fetchMock.mockReturnValue(json(makeRates()));
    await renderProbe("en-IE");

    expect(
      await screen.findByText("~€90–€180 | ~1,520 km | ready"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/rates");
  });

  it("skips the rates request for US dollars", async () => {
    await renderProbe("en-US");

    expect(screen.getByText("$100–$200 | ~940 mi | not-needed")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows USD and reports unavailable when rates fail", async () => {
    fetchMock.mockReturnValue(json({ error: "rates_unavailable" }, 503));
    await renderProbe("de-DE");

    expect(
      await screen.findByText("$100–$200 | ~1,520 km | unavailable"),
    ).toBeInTheDocument();
  });

  it("persists a chosen preference", async () => {
    fetchMock.mockReturnValue(json(makeRates()));
    const units = await renderProbe("en-US");

    act(() => units().setPrefs({ distance: "km", currency: "GBP" }));

    await waitFor(() =>
      expect(screen.getByText("~£80–£160 | ~1,520 km | ready")).toBeInTheDocument(),
    );
    expect(JSON.parse(window.localStorage.getItem("prefs:display") ?? "")).toEqual({
      distance: "km",
      currency: "GBP",
    });
  });
});

describe("useUnits outside a provider", () => {
  it("formats plain USD and kilometres", async () => {
    const { useUnits } = await import("./units-provider");
    function Probe() {
      const { money, distance } = useUnits();
      return <p>{`${money(125)} ${distance(1000)}`}</p>;
    }
    render(<Probe />);
    expect(screen.getByText("$125 ~1,000 km")).toBeInTheDocument();
  });
});
