import { Card, Grid, Heading, Text } from "@radix-ui/themes";
import { Activity, Users } from "lucide-react";
import type { KpiOverview } from "../analytics.admin.types";

function formatNumber(value?: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatDuration(ms?: number) {
  const totalSeconds = Math.round((ms ?? 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function StatCard({
  label,
  value,
  helper,
  accent = false,
}: {
  label: string;
  value: string;
  helper?: string;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "border-(--blue-7) bg-(--blue-2)" : undefined}>
      <Text color="gray" size="2">
        {label}
      </Text>
      <Heading size="6" mt="2">
        {value}
      </Heading>
      {helper ? (
        <Text size="2" color="gray" mt="1">
          {helper}
        </Text>
      ) : null}
    </Card>
  );
}

export function AnalyticsSummary({
  overviewData,
  bounceRateValue,
  bounceRateHelper,
}: {
  overviewData: KpiOverview | undefined;
  bounceRateValue: string;
  bounceRateHelper: string;
}) {
  return (
    <>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} />
          <Heading size="4">Overview</Heading>
        </div>
        <Grid columns={{ initial: "1", sm: "2", lg: "5" }} gap="4">
          <StatCard
            label="Total Visitors"
            value={formatNumber(overviewData?.totalVisitors)}
            helper={`${formatNumber(overviewData?.uniqueVisitors)} unique · ${formatNumber(overviewData?.totalSessions)} sessions`}
            accent
          />
          <StatCard
            label="Unique Visitors"
            value={formatNumber(overviewData?.uniqueVisitors)}
            helper={`${formatNumber(overviewData?.visitorsToday)} today`}
          />
          <StatCard label="Visitors Today" value={formatNumber(overviewData?.visitorsToday)} />
          <StatCard
            label="Visitors This Week"
            value={formatNumber(overviewData?.visitorsThisWeek)}
          />
          <StatCard
            label="Visitors This Month"
            value={formatNumber(overviewData?.visitorsThisMonth)}
          />
        </Grid>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} />
          <Heading size="4">Engagement</Heading>
        </div>
        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4">
          <StatCard label="Total Sessions" value={formatNumber(overviewData?.totalSessions)} />
          <StatCard
            label="Avg. Session"
            value={formatDuration(overviewData?.averageSessionDurationMs)}
          />
          <StatCard label="Page Views" value={formatNumber(overviewData?.totalPageViews)} />
          <StatCard label="Bounce Rate" value={bounceRateValue} helper={bounceRateHelper} />
        </Grid>
      </Card>
    </>
  );
}
