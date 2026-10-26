import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  CONTACT_EMAIL,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
} from "@/lib/legal";

import ContactPage from "./contact/page";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

describe("PrivacyPage", () => {
  it("lists every service that receives data", () => {
    render(<PrivacyPage />);
    for (const name of [
      "Vercel",
      "Upstash",
      "Groq",
      "Sentry",
      "Better Stack",
      "Photon by komoot",
      "OpenFreeMap",
      "Frankfurter",
    ]) {
      expect(screen.getByRole("cell", { name })).toBeInTheDocument();
    }
  });

  it("covers storage, rights, children and grievances", () => {
    render(<PrivacyPage />);
    for (const heading of [
      "Your browser storage",
      "Your rights",
      "Children",
      "Do Not Track",
      "Grievances and contact",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByText(new RegExp(`within ${GRIEVANCE_ACK_HOURS} hours`)),
    ).toBeInTheDocument();
  });
});

describe("TermsPage", () => {
  it("covers sharing rules, AI accuracy, reporting and governing law", () => {
    render(<TermsPage />);
    for (const heading of [
      "Your maps and shared links",
      "What you must not share",
      "AI suggestions",
      "Reporting a map",
      "Governing law",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByText(new RegExp(`within ${GRIEVANCE_RESOLVE_DAYS} days`)),
    ).toBeInTheDocument();
  });
});

describe("ContactPage", () => {
  it("shows the inbox and the Grievance Officer", () => {
    render(<ContactPage />);
    expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Grievance Officer" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
  });
});
