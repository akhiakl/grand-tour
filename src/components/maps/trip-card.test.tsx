import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { tripFingerprint, type LocalTripRecord } from "@/lib/trip";
import { makeTrip } from "@/test/fixtures/trip";

import { TripCard } from "./trip-card";

const record: LocalTripRecord = {
  id: "abc12345",
  trip: makeTrip(2, { title: "Alpine Loop" }),
  updatedAt: Date.now(),
};
const handlers = {
  onShare: vi.fn(),
  onDuplicate: vi.fn(),
  onExport: vi.fn(),
  onDelete: vi.fn(),
};

function renderCard(overrides: Partial<LocalTripRecord> = {}, sharing = false) {
  return render(
    <TripCard
      record={{ ...record, ...overrides }}
      sharing={sharing}
      {...handlers}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TripCard", () => {
  it("links the thumbnail and View button to Map View", () => {
    renderCard();
    expect(screen.getByRole("link", { name: "View Alpine Loop" })).toHaveAttribute(
      "href",
      "/maps/abc12345",
    );
    expect(screen.getByRole("link", { name: "View" })).toHaveAttribute(
      "href",
      "/maps/abc12345",
    );
  });

  it("links Edit to the editor's remix query", () => {
    renderCard();
    expect(screen.getByRole("link", { name: "Edit Alpine Loop" })).toHaveAttribute(
      "href",
      "/new?remix=abc12345",
    );
  });

  it("calls onShare when Share is clicked", async () => {
    renderCard();
    await userEvent.click(screen.getByRole("button", { name: "Share Alpine Loop" }));
    expect(handlers.onShare).toHaveBeenCalledOnce();
  });

  it("disables Share while sharing", () => {
    renderCard({}, true);
    expect(screen.getByRole("button", { name: "Share Alpine Loop" })).toBeDisabled();
  });

  it("duplicates and downloads a backup", async () => {
    renderCard();
    await userEvent.click(
      screen.getByRole("button", { name: "Duplicate Alpine Loop" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Download a backup of Alpine Loop" }),
    );
    expect(handlers.onDuplicate).toHaveBeenCalledOnce();
    expect(handlers.onExport).toHaveBeenCalledOnce();
  });

  it("confirms before deleting", async () => {
    renderCard();
    await userEvent.click(
      screen.getByRole("button", { name: "Delete Alpine Loop" }),
    );
    expect(handlers.onDelete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(handlers.onDelete).toHaveBeenCalledOnce();
  });

  it("links to the last share while it still matches the trip", () => {
    renderCard({
      shared: {
        id: "share123",
        at: Date.now(),
        fingerprint: tripFingerprint(record.trip),
      },
    });
    expect(screen.getByRole("link", { name: "open link" })).toHaveAttribute(
      "href",
      "/t/share123",
    );
  });

  it("nudges to share again once the trip changed since sharing", () => {
    renderCard({
      shared: { id: "share123", at: Date.now(), fingerprint: "outdated" },
    });
    expect(screen.getByText(/Edited since you shared it/)).toBeInTheDocument();
  });
});
