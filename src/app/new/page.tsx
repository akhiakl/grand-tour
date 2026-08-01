import { Suspense } from "react";

import { EditorSkeleton } from "@/components/editor/editor-skeleton";
import { NewEditorPage } from "@/components/editor/new-editor-page";

export const metadata = {
  title: "New trip",
};

export default function NewPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <NewEditorPage />
    </Suspense>
  );
}
