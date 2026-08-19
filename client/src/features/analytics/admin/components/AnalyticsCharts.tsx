import { Box, Card, Flex, Grid, Heading, Separator, Table, Text } from "@radix-ui/themes";
import { Globe2 } from "lucide-react";
import type {
  ContentAnalytics,
  EventCount,
  GeographyAnalytics,
  TechnologyAnalytics,
  TrafficAnalytics,
} from "../analytics.admin.types";
import { AnalyticsChart } from "./AnalyticsChart";
import { BarRow, EmptyState } from "./AnalyticsEmptyState";

const eventLabels: Record<string, string> = {
  page_view: "Page View",
  section_view: "Section View",
  project_view: "Project Viewed",
  project_demo_click: "Live Demo Clicked",
  project_github_click: "GitHub Clicked",
  contact_open: "Contact Opened",
  contact_form_start: "Contact Form Started",
  contact_submit: "Contact Submitted",
  contact_success: "Contact Success",
  game_open: "Game Opened",
  game_start: "Game Started",
  game_level_selected: "Game Level Selected",
  game_complete: "Game Completed",
  game_abandon: "Game Abandoned",
  performance: "Performance",
  client_error: "Client Error",
  session_start: "Session Started",
};

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

export function AnalyticsCharts({
  traffic,
  content,
  events,
  technology,
  geography,
  maxTimeline,
  maxSources,
  maxEvents,
}: {
  traffic: TrafficAnalytics | undefined;
  content: ContentAnalytics | undefined;
  events: EventCount[];
  technology: TechnologyAnalytics | undefined;
  geography: GeographyAnalytics | undefined;
  maxTimeline: number;
  maxSources: number;
  maxEvents: number;
}) {
  const topTimeline = traffic?.timeseries ?? [];
  const sources = traffic?.sources ?? [];

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", lg: "2" }} gap="5">
        <Card>
          <Heading size="4" mb="3">
            Traffic Over Time
          </Heading>
          <Flex direction="column" gap="3">
            {topTimeline.length ? (
              topTimeline.map((point) => (
                <BarRow
                  key={point.date}
                  label={new Date(point.date).toLocaleDateString()}
                  value={point.pageViews}
                  max={maxTimeline}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </Flex>
        </Card>
        <Card>
          <Heading size="4" mb="3">
            Traffic Sources
          </Heading>
          <Flex direction="column" gap="3">
            {sources.length ? (
              sources.map((source) => (
                <BarRow
                  key={source.referrer}
                  label={source.referrer}
                  value={source.sessions}
                  max={maxSources}
                  showBar={sources.length > 1}
                />
              ))
            ) : (
              <EmptyState />
            )}
            <Separator />
            <Text size="2">
              New visitors: <strong>{formatNumber(traffic?.newVisitors)}</strong> · Returning
              visitors: <strong>{formatNumber(traffic?.returningVisitors)}</strong>
            </Text>
            <EmptyState>No UTM campaign data yet.</EmptyState>
          </Flex>
        </Card>
      </Grid>

      <Grid columns={{ initial: "1", lg: "2" }} gap="5">
        <Card>
          <Heading size="4" mb="3">
            Pages &amp; Content
          </Heading>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Page</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Views</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Unique</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Avg time</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(content?.pages ?? []).slice(0, 12).map((page) => (
                <Table.Row key={page.path}>
                  <Table.Cell>{page.path}</Table.Cell>
                  <Table.Cell>{formatNumber(page.views)}</Table.Cell>
                  <Table.Cell>{formatNumber(page.uniqueVisitors)}</Table.Cell>
                  <Table.Cell>{formatDuration(page.averageTimeMs)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
        <Card>
          <Heading size="4" mb="3">
            Top Interactions
          </Heading>
          <Flex direction="column" gap="3">
            {events.length ? (
              events.map((event) => (
                <BarRow
                  key={event.type}
                  label={eventLabels[event.type] ?? event.type}
                  value={event.count}
                  max={maxEvents}
                  showBar={events.length > 1}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </Flex>
        </Card>
      </Grid>

      <Grid columns={{ initial: "1", lg: "2" }} gap="5">
        <AnalyticsChart title="Devices" items={technology?.devices ?? []} />
        <AnalyticsChart title="Browsers" items={technology?.browsers ?? []} />
        <AnalyticsChart title="Operating Systems" items={technology?.operatingSystems ?? []} />
        <AnalyticsChart title="Screen Sizes" items={technology?.screens ?? []} />
      </Grid>

      <Card>
        <Flex align="center" gap="2" mb="3">
          <Globe2 size={18} />
          <Heading size="4">Geography</Heading>
        </Flex>
        {geography?.isPopulated ? (
          <Grid columns={{ initial: "1", md: "3" }} gap="4">
            {(["countries", "regions", "cities"] as const).map((key) => {
              const items = geography?.[key] ?? [];
              const max = Math.max(...items.map((entry) => entry.visitors), 0);
              return (
                <Box key={key}>
                  <Heading size="3" mb="2" className="capitalize">
                    {key}
                  </Heading>
                  <Flex direction="column" gap="2">
                    {items.map((item) => (
                      <BarRow
                        key={`${key}-${item.label}`}
                        label={item.label}
                        value={item.visitors}
                        max={max}
                        showBar={items.length > 1}
                      />
                    ))}
                  </Flex>
                </Box>
              );
            })}
          </Grid>
        ) : (
          <EmptyState>No geography data yet.</EmptyState>
        )}
      </Card>
    </Flex>
  );
}
