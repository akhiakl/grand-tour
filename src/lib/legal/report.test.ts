import { describe, expect, it } from "vitest";

import { CONTACT_EMAIL, reportMapMailto } from ".";

const MAP_URL = "https://grandtour.example/t/abc12345";

function parse(href: string) {
  const url = new URL(href);
  return {
    to: url.pathname,
    subject: url.searchParams.get("subject"),
    body: url.searchParams.get("body") ?? "",
  };
}

describe("reportMapMailto", () => {
  it("addresses the contact inbox", () => {
    expect(parse(reportMapMailto(MAP_URL)).to).toBe(CONTACT_EMAIL);
  });

  it("names the reported map in the subject and body", () => {
    const { subject, body } = parse(reportMapMailto(MAP_URL));
    expect(subject).toBe(`Report a map: ${MAP_URL}`);
    expect(body.startsWith(`Map: ${MAP_URL}\n`)).toBe(true);
  });

  it("asks for every field a notice needs", () => {
    const { body } = parse(reportMapMailto(MAP_URL));
    expect(body).toContain("Reason");
    expect(body).toContain("What's wrong and why");
    expect(body).toContain("Your name (optional)");
    expect(body).toContain("accurate and complete");
  });

  it("encodes the subject and body so the link stays intact", () => {
    const href = reportMapMailto(MAP_URL);
    expect(href).not.toMatch(/\s/);
    expect(href.match(/\?/g)).toHaveLength(1);
  });
});
