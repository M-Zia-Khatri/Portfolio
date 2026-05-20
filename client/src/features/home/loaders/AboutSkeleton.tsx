import SkeletonBlock from "./SkeletonBlock";

export default function AboutSkeleton() {
  return (
    <div className="w-full max-w-6xl px-4">
      <div className="grid gap-6 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        <div className="order-2 px-4 md:px-0 sm:order-1">
          <SkeletonBlock className="aspect-[4/5] w-full rounded-xl" />
        </div>
        <div className="order-1 flex flex-col justify-center gap-3 sm:order-2 sm:col-span-2">
          <SkeletonBlock className="h-9 w-44" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-[95%]" />
          <SkeletonBlock className="h-4 w-[90%]" />
          <SkeletonBlock className="h-4 w-[85%]" />
        </div>
      </div>
    </div>
  );
}
