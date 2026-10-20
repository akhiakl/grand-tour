import { OffTheMap } from "@/components/off-the-map";

export default function SharedTripNotFound() {
  return (
    <OffTheMap
      title="This map has expired"
      action={{ href: "/new", label: "Create your own" }}
    >
      Shared routes stay live for 60 days after their last visit, and this one&apos;s
      trail has gone cold. You can always draw a new one.
    </OffTheMap>
  );
}
