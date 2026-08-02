import type { Metadata } from "next";
import { Suspense } from "react";

import { EditorPage } from "@/components/editor/editor-page";

export const metadata: Metadata = {
  title: "Build a trip",
};

export default function NewPage() {
  return (
    <Suspense fallback={null}>
      <EditorPage />
    </Suspense>
  );
}
