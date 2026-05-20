import SkeletonBlock from "./SkeletonBlock";

export default function ContactSkeleton() {
  const skeletonRowKeys = [
    "row-1",
    "row-2",
    "row-3",
    "row-4",
    "row-5",
    "row-6",
    "row-7",
    "row-8",
    "row-9",
    "row-10",
  ];

  return (
    <div className="mt-4 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/10 p-5">
        <SkeletonBlock className="mb-4 h-8 w-40" />
        <div className="space-y-3">
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-11 w-full" />
          <SkeletonBlock className="h-28 w-full" />
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </div>

      <div className="hidden rounded-xl border border-white/10 p-5 lg:block">
        <div className="mb-3 flex gap-2">
          <SkeletonBlock className="h-3 w-3 rounded-full" />
          <SkeletonBlock className="h-3 w-3 rounded-full" />
          <SkeletonBlock className="h-3 w-3 rounded-full" />
        </div>
        <div className="space-y-2">
          {skeletonRowKeys.map((key) => (
            <SkeletonBlock key={key} className="h-3 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
