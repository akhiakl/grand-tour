import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-6">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-[50vh] w-full rounded-2xl lg:h-[calc(100dvh-6rem)]" />
    </div>
  );
}
