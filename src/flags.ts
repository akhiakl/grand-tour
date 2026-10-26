import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

/** Switches the public-test feedback button on. */
export const testerFeedback = flag<boolean>({
  key: "tester-feedback",
  description: "Show the tester feedback button",
  defaultValue: false,
  adapter: vercelAdapter,
});
