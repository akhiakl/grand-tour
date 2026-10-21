import { describe, expect, it } from "vitest";

import { CONTACT_EMAIL, reportMapMailto } from ".";

const REPORT = { subject: "Report a map: x", body: "Map: x\n\nReason:" };

function parse(href: string) {
  const url = new URL(href);
  return {
    to: url.pathname,
    subject: url.searchParams.get("subject"),
    body: url.searchParams.get("body") ?? "",
  };
}

describe("reportMapMailto", () => {
  it("addresses the contact inbox with the given subject and body", () => {
    expect(parse(reportMapMailto(REPORT))).toEqual({
      to: CONTACT_EMAIL,
      subject: REPORT.subject,
      body: REPORT.body,
    });
  });

  it("encodes the subject and body so the link stays intact", () => {
    const href = reportMapMailto(REPORT);
    expect(href).not.toMatch(/\s/);
    expect(href.match(/\?/g)).toHaveLength(1);
  });
});
