import SkeletonBlock from "./SkeletonBlock";

export default function SkillsSkeleton() {
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
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-8 sm:max-w-xl md:gap-12">
      <div className="space-y-2 text-center">
        <SkeletonBlock className="mx-auto h-9 w-44" />
        <SkeletonBlock className="mx-auto h-4 w-36" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-2.5 lg:gap-3">
        {skeletonRowKeys.map((key) => (
          <SkeletonBlock key={key} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <div className="w-full rounded-xl border border-white/10 p-4">
        <div className="mb-4 flex gap-2">
          <SkeletonBlock className="h-7 w-24 rounded-t-md" />
          <SkeletonBlock className="h-7 w-20 rounded-t-md" />
          <SkeletonBlock className="h-7 w-16 rounded-t-md" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-[92%]" />
          <SkeletonBlock className="h-3 w-[86%]" />
          <SkeletonBlock className="h-3 w-[94%]" />
          <SkeletonBlock className="h-3 w-[70%]" />
          <SkeletonBlock className="h-3 w-[88%]" />
        </div>
      </div>
    </div>
  );
}
