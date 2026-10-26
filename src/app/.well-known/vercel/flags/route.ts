import { getProviderData } from "@flags-sdk/vercel";
import { createFlagsDiscoveryEndpoint } from "flags/next";

import * as flags from "@/flags";

// Lets the Vercel Toolbar's Flags Explorer list and override our flags.
export const GET = createFlagsDiscoveryEndpoint(async () => getProviderData(flags));
