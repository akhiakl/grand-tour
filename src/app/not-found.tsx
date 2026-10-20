import { OffTheMap } from "@/components/off-the-map";

export default function NotFound() {
  return (
    <OffTheMap
      title="No road leads here"
      action={{ href: "/", label: "Back to the atlas" }}
    >
      This page isn&apos;t on any map we&apos;ve drawn. Head back and start a new
      route from the atlas.
    </OffTheMap>
  );
}
