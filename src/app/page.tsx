import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Placeholder shell — proves tokens, fonts and theming end-to-end.
 * The full landing experience ships in build-order step 7.
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <section className="frost w-full max-w-lg p-10 text-center">
        <p className="eyebrow">Field Atlas · Phase 1</p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-tight">
          Grand Tour
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Craft a beautiful, interactive travel route map — drawn by{" "}
          <em className="font-display italic text-brass">AI</em> or by hand — and
          share it with a single link.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ThemeToggle />
        </div>
      </section>
    </main>
  );
}
