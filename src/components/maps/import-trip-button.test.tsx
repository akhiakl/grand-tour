import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { serializeTripFile } from "@/lib/trip";
import { makeTrip } from "@/test/fixtures/trip";

import { ImportTripButton } from "./import-trip-button";

const toastMocks = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock("sonner", () => ({ toast: toastMocks }));

const onImport = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

const pick = (content: string) =>
  userEvent.upload(
    screen.getByLabelText("Map backup file"),
    new File([content], "map.json", { type: "application/json" }),
  );

describe("ImportTripButton", () => {
  it("hands a valid backup's trip to onImport", async () => {
    const trip = makeTrip(2, { title: "Alps" });
    render(<ImportTripButton onImport={onImport} />);
    await pick(serializeTripFile(trip));
    expect(onImport).toHaveBeenCalledWith(trip);
  });

  it("explains an unreadable file instead of importing it", async () => {
    render(<ImportTripButton onImport={onImport} />);
    await pick("not json");
    expect(onImport).not.toHaveBeenCalled();
    expect(toastMocks.error).toHaveBeenCalledWith(
      expect.stringContaining("isn't a Grand Tour backup"),
    );
  });
});
