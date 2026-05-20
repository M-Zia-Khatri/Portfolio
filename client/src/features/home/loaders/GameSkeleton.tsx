import SkeletonBlock from "./SkeletonBlock";

export default function GameSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-6 lg:flex-row">
      <aside className="hidden w-full lg:flex lg:w-1/4">
        <div className="flex h-full w-full flex-col rounded-xl border border-white/10 p-4">
          <SkeletonBlock className="mb-3 h-6 w-2/3" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </aside>

      <section className="flex flex-1 flex-col gap-4">
        <div className="rounded-xl border border-white/10 p-4 text-center">
          <SkeletonBlock className="mx-auto h-9 w-56" />
        </div>
        <div className="rounded-xl border border-white/10 p-6">
          <SkeletonBlock className="mx-auto h-14 w-40" />
        </div>
        <div className="flex-1 rounded-xl border border-white/10 p-4">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </section>

      <aside className="w-full lg:w-1/3">
        <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-white/10 p-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-6 w-40" />
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-full" />
            ))}
          </div>
          <SkeletonBlock className="h-10 w-full" />
        </div>
      </aside>
    </div>
  );
}
