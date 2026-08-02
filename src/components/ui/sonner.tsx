"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast frost !rounded-2xl !border-line !bg-popover !text-foreground !shadow-soft",
          description: "!text-muted-foreground",
          actionButton: "!bg-brass !text-paper",
          cancelButton: "!bg-secondary !text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
