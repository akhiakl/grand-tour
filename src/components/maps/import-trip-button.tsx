"use client";

import { FileUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseTripFile, type Trip } from "@/lib/trip";

/** Picks a backup file and hands its validated trip to `onImport`. */
export function ImportTripButton({
  onImport,
}: {
  readonly onImport: (trip: Trip) => void;
}) {
  const t = useTranslations("Maps.import");
  const input = useRef<HTMLInputElement>(null);

  const read = async (file: File) => {
    const result = parseTripFile(await file.text());
    if (result.ok) onImport(result.trip);
    else toast.error(t(result.error));
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        name="backup"
        accept="application/json,.json"
        aria-label={t("fileLabel")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void read(file);
        }}
      />
      <Button type="button" variant="outline" onClick={() => input.current?.click()}>
        <FileUp /> {t("button")}
      </Button>
    </>
  );
}
