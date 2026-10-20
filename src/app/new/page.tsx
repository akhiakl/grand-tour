import type { Metadata } from "next";
import { Suspense } from "react";

import { EditorPage } from "@/components/editor/editor-page";

export const metadata: Metadata = {
  title: "Build a trip",
  description:
    "Draw your route stop by stop: cities, nights, legs and the notes that make each one yours.",
};

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <EditorPage />
    </Suspense>
  );
}
