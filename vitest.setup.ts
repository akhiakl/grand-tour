import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Auto-cleanup only registers itself when vitest globals are enabled;
// we use explicit imports, so unmount rendered trees between tests here.
afterEach(() => {
  cleanup();
});
