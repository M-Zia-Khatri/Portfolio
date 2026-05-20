import SkeletonBlock from "./SkeletonBlock";

export default function HeroSkeleton() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden text-center">
      <div className="space-y-3 px-4">
        <SkeletonBlock className="mx-auto h-12 w-64 sm:h-14 sm:w-80 md:h-16 md:w-[28rem]" />
        <SkeletonBlock className="mx-auto h-12 w-56 sm:h-14 sm:w-72 md:h-16 md:w-[24rem]" />
        <SkeletonBlock className="mx-auto h-12 w-60 sm:h-14 sm:w-76 md:h-16 md:w-[26rem]" />
      </div>
    </div>
  );
}
