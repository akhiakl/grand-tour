import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CONTACT_EMAIL } from "@/lib/legal";

import { CopyEmail } from "./copy-email";
import { LegalLinks } from "./legal-links";
import { LegalPage } from "./legal-page";
import { AiNotice, TermsNotice } from "./notices";
import { ReportMapLink } from "./report-map-link";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LegalLinks", () => {
  it("links to contact, privacy and terms after any extra items", () => {
    render(
      <LegalLinks>
        <span>Extra</span>
      </LegalLinks>,
    );
    const nav = screen.getByRole("navigation", { name: "Legal" });
    expect(nav).toHaveTextContent(/^ExtraContactPrivacyTerms$/);
    expect(within(nav).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});

describe("ReportMapLink", () => {
  it("pre-fills a report about the current page", () => {
    window.history.pushState({}, "", "/t/abc12345?ref=x");
    render(<ReportMapLink />);
    const href = screen
      .getByRole("link", { name: "Report this map" })
      .getAttribute("href");
    expect(href).toMatch(new RegExp(`^mailto:${CONTACT_EMAIL}\\?`));
    expect(decodeURIComponent(href ?? "")).toContain(
      `Report a map: ${window.location.origin}/t/abc12345`,
    );
    expect(decodeURIComponent(href ?? "")).not.toContain("ref=x");
  });
});

describe("notices", () => {
  it("tells people they are planning with an AI that can be wrong", () => {
    render(<AiNotice />);
    expect(screen.getByText("You're planning with an AI.")).toBeVisible();
    expect(screen.getByText(/can be wrong/)).toBeVisible();
  });

  it("names the action and links the terms and privacy notice", () => {
    render(<TermsNotice action="sharing" />);
    expect(screen.getByText(/By sharing this link you agree/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});

describe("CopyEmail", () => {
  it("shows the address and copies it", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<CopyEmail email={CONTACT_EMAIL} />);

    expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute(
      "href",
      `mailto:${CONTACT_EMAIL}`,
    );
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith(CONTACT_EMAIL);
    expect(screen.getByRole("button", { name: "Copied" })).toBeVisible();
  });

  it("keeps the address visible when the clipboard refuses", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<CopyEmail email={CONTACT_EMAIL} />);

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("button", { name: "Copy" })).toBeVisible();
    expect(screen.getByText(CONTACT_EMAIL)).toBeVisible();
  });
});

describe("LegalPage", () => {
  const sections = [
    { id: "one", title: "First part", body: <p>Body one</p> },
    { id: "two", title: "Second part", body: <p>Body two</p> },
  ];

  it("renders the summary, a contents list and each section", () => {
    render(
      <LegalPage
        eyebrow="Notice"
        title="Privacy"
        summary={<p>Short</p>}
        sections={sections}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeVisible();
    expect(screen.getByText("Short")).toBeVisible();
    expect(screen.getByText(/Last updated/)).toBeVisible();
    const contents = screen.getByRole("navigation", { name: "On this page" });
    expect(
      within(contents).getByRole("link", { name: "Second part" }),
    ).toHaveAttribute("href", "#two");
    expect(screen.getByRole("region", { name: "First part" })).toHaveTextContent(
      "Body one",
    );
  });

  it("can leave out the revision date", () => {
    render(
      <LegalPage
        eyebrow="Get in touch"
        title="Contact"
        summary={<p>Short</p>}
        sections={sections}
        updated={false}
      />,
    );
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
  });
});
