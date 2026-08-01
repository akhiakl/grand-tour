"use client";

import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";

/** Newline-separated editor for a `string[]` field — commits on blur so Enter never snaps back. */
export function ListFieldEditor({
  label,
  value,
  onChange,
  max,
  placeholder,
}: {
  readonly label: string;
  readonly value: string[];
  readonly onChange: (next: string[]) => void;
  readonly max: number;
  readonly placeholder?: string;
}) {
  const [text, setText] = useState(value.join("\n"));

  const commit = () => {
    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, max);
    onChange(items);
    setText(items.join("\n"));
  };

  return (
    <div>
      <label className="eyebrow mb-1.5 flex items-baseline justify-between">
        {label}
        <span className="text-[10px] font-normal tracking-normal normal-case text-muted-foreground">
          {value.length}/{max}
        </span>
      </label>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        placeholder={placeholder ?? "One per line…"}
        rows={3}
      />
    </div>
  );
}
