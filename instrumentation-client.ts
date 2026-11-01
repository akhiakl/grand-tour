import * as z from "zod";

import { watchGlobalErrors } from "@/lib/monitoring";

// Our CSP forbids 'unsafe-eval'; zod's JIT probe (`new Function`) would be
// reported as a violation in DevTools even though zod falls back on its own.
z.config({ jitless: true });

watchGlobalErrors();
