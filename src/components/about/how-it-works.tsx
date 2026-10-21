import { MessageSquareText, Route, Share2 } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Describe",
    body: "Tell the AI planner where, how long and what pace, or add cities by hand.",
  },
  {
    icon: Route,
    title: "Shape",
    body: "Reorder stops, pick trains, flights or drives, and set nights in each place.",
  },
  {
    icon: Share2,
    title: "Share",
    body: "Send one link to your travel companions, or save the route as a poster.",
  },
] as const;

/** The three steps from idea to shared map, in order. */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">How it works</p>
        <h2
          id="how-title"
          className="font-display text-3xl font-medium tracking-tight"
        >
          From a hunch to a shared map in minutes
        </h2>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="frost flex flex-col gap-2 rounded-2xl p-5">
            <span className="flex items-center gap-2 text-brass-text">
              <Icon aria-hidden className="size-4" />
              <span className="eyebrow">Step {i + 1}</span>
            </span>
            <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
            <p className="text-sm text-ink-soft">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
