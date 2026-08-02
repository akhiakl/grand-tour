import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeTrip } from "@/test/fixtures/trip";

import { TripCard } from "./trip-card";

const record = {
  id: "abc12345",
  trip: makeTrip(2, { title: "Alpine Loop" }),
  updatedAt: Date.now(),
};
const onShare = vi.fn();
const onDelete = vi.fn();

beforeEach(() => {
  onShare.mockClear();
  onDelete.mockClear();
});

describe("TripCard", () => {
  it("links the thumbnail and View button to Map View", () => {
    render(
      <TripCard
        record={record}
        sharing={false}
        onShare={onShare}
        onDelete={onDelete}
      />,
    );

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
    render(
      <TripCard
        record={record}
        sharing={false}
        onShare={onShare}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByRole("link", { name: "Edit Alpine Loop" })).toHaveAttribute(
      "href",
      "/new?remix=abc12345",
    );
  });

  it("calls onShare when Share is clicked", async () => {
    render(
      <TripCard
        record={record}
        sharing={false}
        onShare={onShare}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Share Alpine Loop" }));
    expect(onShare).toHaveBeenCalledOnce();
  });

  it("disables Share while sharing", () => {
    render(
      <TripCard record={record} sharing onShare={onShare} onDelete={onDelete} />,
    );
    expect(screen.getByRole("button", { name: "Share Alpine Loop" })).toBeDisabled();
  });

  it("confirms before deleting", async () => {
    render(
      <TripCard
        record={record}
        sharing={false}
        onShare={onShare}
        onDelete={onDelete}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete Alpine Loop" }),
    );
    expect(onDelete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
