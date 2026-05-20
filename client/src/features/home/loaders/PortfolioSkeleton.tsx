import SkeletonBlock from "./SkeletonBlock";

export default function PortfolioSkeleton() {
 const skeletonRowKeys = ["row-1", "row-2", "row-3", "row-4"];
  
  return (
    <div className="flex w-full flex-col items-center gap-8 md:gap-10 lg:gap-12 xl:gap-14">
      <div className="space-y-2 text-center">
        <SkeletonBlock className="mx-auto h-9 w-44" />
        <SkeletonBlock className="mx-auto h-4 w-28" />
      </div>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 md:gap-3 lg:gap-4">
        {skeletonRowKeys.map((key) => (
          <div key={key} className="rounded-xl border border-white/10 p-4">
            <SkeletonBlock className="h-48 w-full rounded-lg" />
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-1/2" />
              <div className="flex flex-wrap gap-2 pt-1">
                <SkeletonBlock className="h-6 w-14 rounded-full" />
                <SkeletonBlock className="h-6 w-16 rounded-full" />
                <SkeletonBlock className="h-6 w-12 rounded-full" />
              </div>
              <SkeletonBlock className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
