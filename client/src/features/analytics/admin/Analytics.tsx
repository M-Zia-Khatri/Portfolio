import { Container, Flex, Grid } from "@radix-ui/themes";
import { useState } from "react";
import SEO from "@/shared/components/SEO";
import type { VisitorSummary } from "./analytics.admin.types";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { AnalyticsHeader } from "./components/AnalyticsHeader";
import { AnalyticsLoading } from "./components/AnalyticsLoading";
import { AnalyticsPagination } from "./components/AnalyticsPagination";
import { AnalyticsSummary } from "./components/AnalyticsSummary";
import { AnalyticsTable } from "./components/AnalyticsTable";
import { useAnalytics } from "./hooks/useAnalytics";
import { useAnalyticsFilters } from "./hooks/useAnalyticsFilters";

export default function Analytics() {
  const { range, setRange } = useAnalyticsFilters();
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorSummary | null>(null);

  const {
    isLoading,
    traffic,
    content,
    technology,
    geography,
    visitors,
    overviewData,
    bounceRateValue,
    bounceRateHelper,
    maxTimeline,
    maxSources,
    maxEvents,
    eventCounts,
  } = useAnalytics(range);

  return (
    <Container size="4" py="6">
      <SEO
        title="Admin - Analytics"
        description="Portfolio analytics dashboard for admin users."
        canonical="https://ziakhatri.site/dashboard/analytics"
      />
      <AnalyticsHeader range={range} onRangeChange={setRange} />

      {isLoading ? <AnalyticsLoading /> : null}

      {!isLoading && (
        <Flex direction="column" gap="6">
          <AnalyticsSummary
            overviewData={overviewData}
            bounceRateValue={bounceRateValue}
            bounceRateHelper={bounceRateHelper}
          />
          <AnalyticsCharts
            traffic={traffic.data}
            content={content.data}
            events={eventCounts}
            technology={technology.data}
            geography={geography.data}
            maxTimeline={maxTimeline}
            maxSources={maxSources}
            maxEvents={maxEvents}
          />
          <Grid columns={{ initial: "1", xl: "2" }} gap="5">
            <AnalyticsTable
              visitors={visitors.data ?? []}
              onSelectVisitor={setSelectedVisitor}
            />
            <AnalyticsPagination
              key={selectedVisitor?.id ?? "empty"}
              visitor={selectedVisitor}
            />
          </Grid>
        </Flex>
      )}
    </Container>
  );
}
