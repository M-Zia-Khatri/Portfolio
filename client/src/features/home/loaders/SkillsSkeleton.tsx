import SkeletonBlock from "./SkeletonBlock";

export default function SkillsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-8 sm:max-w-xl md:gap-12">
      <div className="space-y-2 text-center">
        <SkeletonBlock className="mx-auto h-9 w-44" />
        <SkeletonBlock className="mx-auto h-4 w-36" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-2.5 lg:gap-3">
        {Array.from({ length: 10 }).map((_, idx) => (
          <SkeletonBlock key={idx} className="h-8 w-20 rounded-full" />
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
