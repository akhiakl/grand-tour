import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageLoading } from "./page-loading";

describe("PageLoading", () => {
  it("tells assistive tech the page is loading", () => {
    render(<PageLoading />);
    expect(screen.getByRole("status")).toHaveTextContent("Unfolding the map…");
  });
});
