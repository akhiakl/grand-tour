"use client";

import { FileUp } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseTripFile, type Trip, type TripFileError } from "@/lib/trip";

const IMPORT_ERRORS: Record<TripFileError, string> = {
  too_large: "That file is far too big to be a Grand Tour map.",
  not_json: "That file isn't a Grand Tour backup. Pick a .json map file.",
  not_a_trip: "That file doesn't hold a map this atlas can read (up to 5 stops).",
};

/** Picks a backup file and hands its validated trip to `onImport`. */
export function ImportTripButton({
  onImport,
}: {
  readonly onImport: (trip: Trip) => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  const read = async (file: File) => {
    const result = parseTripFile(await file.text());
    if (result.ok) onImport(result.trip);
    else toast.error(IMPORT_ERRORS[result.error]);
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        aria-label="Map backup file"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void read(file);
        }}
      />
      <Button type="button" variant="outline" onClick={() => input.current?.click()}>
        <FileUp /> Import
      </Button>
    </>
  );
}
