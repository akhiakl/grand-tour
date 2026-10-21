"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

// Animation and drag features load after first paint, keeping them out of
// the startup bundle. Components use `m.*`; `strict` rejects `motion.*`.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { readonly children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
