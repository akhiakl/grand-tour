import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("flags discovery endpoint", () => {
  it("rejects requests without the Flags Explorer authorization", async () => {
    const res = await GET(
      new Request("http://localhost/.well-known/vercel/flags") as never,
    );

    expect(res.status).toBe(401);
  });
});
