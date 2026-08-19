import { Grid, Skeleton } from "@radix-ui/themes";
import { cn } from "@/shared/utils/cn";

function CardSkeleton() {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-4)] overflow-hidden",
        "border border-[var(--gray-4)] bg-[var(--gray-2)]",
      )}
    >
      <Skeleton className={cn("h-44 w-full")} />
      <div className={cn("p-4 flex flex-col gap-2")}>
        <Skeleton className={cn("h-4 w-3/4")} />
        <Skeleton className={cn("h-3 w-1/2")} />
        <Skeleton className={cn("h-3 w-full")} />
        <Skeleton className={cn("h-3 w-full")} />
      </div>
    </div>
  );
}

export function PortfolioLoading() {
  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
      {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
        <CardSkeleton key={id} />
      ))}
    </Grid>
  );
}
