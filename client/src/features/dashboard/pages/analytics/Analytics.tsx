import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Select,
  Separator,
  Spinner,
  Table,
  Text,
} from "@radix-ui/themes";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, Globe2, Laptop, MousePointerClick, Users } from "lucide-react";
import { useState } from "react";
import SEO from "@/shared/components/SEO";
import {
  fetchAnalyticsOverview,
  fetchContentAnalytics,
  fetchGeographyAnalytics,
  fetchTechnologyAnalytics,
  fetchTopEvents,
  fetchTrafficAnalytics,
  fetchVisitorDetail,
  fetchVisitors,
} from "./api";
import type { AnalyticsRange, BreakdownItem, VisitorSummary } from "./types";

const ranges: { label: string; value: AnalyticsRange }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

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
};

function formatNumber(value?: number) {
  return new Intl.NumberFormat().format(value ?? 0);
}

function formatPercent(value?: number) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

function formatDuration(ms?: number) {
  const totalSeconds = Math.round((ms ?? 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[minmax(110px,1fr)_2fr_70px] items-center gap-3 text-sm">
      <Text truncate>{label}</Text>
      <div className="h-2 overflow-hidden rounded-full bg-(--gray-4)">
        <div className="h-full rounded-full bg-(--blue-9)" style={{ width: `${width}%` }} />
      </div>
      <Text align="right" color="gray">
        {formatNumber(value)}
      </Text>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: BreakdownItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 0);
  return (
    <Card>
      <Heading size="4" mb="3">
        {title}
      </Heading>
      <Flex direction="column" gap="3">
        {items.length ? (
          items.map((item) => (
            <BarRow key={item.label} label={item.label} value={item.count} max={max} />
          ))
        ) : (
          <Text color="gray">No populated data for this range.</Text>
        )}
      </Flex>
    </Card>
  );
}

function VisitorDetailPanel({ visitor }: { visitor: VisitorSummary | null }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "visitor", visitor?.id],
    queryFn: () => fetchVisitorDetail(visitor?.id ?? ""),
    enabled: Boolean(visitor?.id),
  });

  if (!visitor) {
    return (
      <Card>
        <Text color="gray">Select a visitor to view the activity timeline.</Text>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <Flex justify="between" align="start" mb="3">
        <Box>
          <Heading size="4">Visitor Detail</Heading>
          <Text color="gray" size="2">
            {data.visitorId}
          </Text>
        </Box>
        <Badge color="blue">{formatDuration(data.totalDurationMs)}</Badge>
      </Flex>
      <Grid columns={{ initial: "2", md: "4" }} gap="3" mb="4">
        <Text>
          First seen
          <br />
          <strong>{formatDate(data.firstSeen)}</strong>
        </Text>
        <Text>
          Last seen
          <br />
          <strong>{formatDate(data.lastSeen)}</strong>
        </Text>
        <Text>
          Sessions
          <br />
          <strong>{formatNumber(data.sessions)}</strong>
        </Text>
        <Text>
          Page views
          <br />
          <strong>{formatNumber(data.pageViews)}</strong>
        </Text>
      </Grid>
      <Separator my="3" />
      <Flex direction="column" gap="2" className="max-h-80 overflow-auto">
        {data.timeline.map((item) => (
          <Flex
            key={item.id}
            justify="between"
            gap="3"
            className="rounded-md bg-(--gray-2) px-3 py-2"
          >
            <Text size="2">
              {eventLabels[item.type] ?? item.type}
              {item.path ? ` · ${item.path}` : ""}
            </Text>
            <Text size="2" color="gray">
              {formatDate(item.timestamp)}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorSummary | null>(null);

  const [overview, traffic, content, events, technology, geography, visitors] = useQueries({
    queries: [
      { queryKey: ["analytics", "overview", range], queryFn: () => fetchAnalyticsOverview(range) },
      { queryKey: ["analytics", "traffic", range], queryFn: () => fetchTrafficAnalytics(range) },
      { queryKey: ["analytics", "content", range], queryFn: () => fetchContentAnalytics(range) },
      { queryKey: ["analytics", "events", range], queryFn: () => fetchTopEvents(range) },
      {
        queryKey: ["analytics", "technology", range],
        queryFn: () => fetchTechnologyAnalytics(range),
      },
      {
        queryKey: ["analytics", "geography", range],
        queryFn: () => fetchGeographyAnalytics(range),
      },
      { queryKey: ["analytics", "visitors", range], queryFn: () => fetchVisitors(range) },
    ],
  });

  const isLoading = [overview, traffic, content, events, technology, geography, visitors].some(
    (query) => query.isLoading,
  );
  const topTimeline = traffic.data?.timeseries ?? [];
  const maxTimeline = Math.max(...topTimeline.map((point) => point.pageViews), 0);
  const maxEvents = Math.max(...(events.data ?? []).map((event) => event.count), 0);

  return (
    <Container size="4" py="6">
      <SEO
        title="Admin - Analytics"
        description="Portfolio analytics dashboard for admin users."
        canonical="https://ziakhatri.site/dashboard/analytics"
      />
      <Flex justify="between" align="center" mb="6">
        <Box>
          <Heading size="8">Analytics</Heading>
          <Text color="gray">
            Privacy-conscious visitor, traffic, content, event, device, and geography reporting.
          </Text>
        </Box>
        <Select.Root value={range} onValueChange={(value) => setRange(value as AnalyticsRange)}>
          <Select.Trigger />
          <Select.Content>
            {ranges.map((item) => (
              <Select.Item key={item.value} value={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      {isLoading ? (
        <Flex justify="center" p="9">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {!isLoading && (
        <Flex direction="column" gap="6">
          <Grid columns={{ initial: "1", sm: "2", lg: "5" }} gap="4">
            {[
              ["Total Visitors", overview.data?.totalVisitors, Users],
              ["Unique Visitors", overview.data?.uniqueVisitors, Users],
              ["Visitors Today", overview.data?.visitorsToday, Activity],
              ["Visitors This Week", overview.data?.visitorsThisWeek, Activity],
              ["Visitors This Month", overview.data?.visitorsThisMonth, Activity],
              ["Total Sessions", overview.data?.totalSessions, BarChart3],
              ["Avg. Session", formatDuration(overview.data?.averageSessionDurationMs), BarChart3],
              ["Page Views", overview.data?.totalPageViews, MousePointerClick],
              ["Bounce Rate", formatPercent(overview.data?.bounceRate), BarChart3],
            ].map(([label, value, Icon]) => (
              <Card key={String(label)}>
                <Flex justify="between" align="center">
                  <Text color="gray" size="2">
                    {label}
                  </Text>
                  {typeof Icon !== "number" && <Icon size={18} />}
                </Flex>
                <Heading size="6" mt="2">
                  {typeof value === "number" ? formatNumber(value) : value}
                </Heading>
              </Card>
            ))}
          </Grid>

          <Grid columns={{ initial: "1", lg: "2" }} gap="5">
            <Card>
              <Heading size="4" mb="3">
                Traffic Over Time
              </Heading>
              <Flex direction="column" gap="3">
                {topTimeline.map((point) => (
                  <BarRow
                    key={point.date}
                    label={new Date(point.date).toLocaleDateString()}
                    value={point.pageViews}
                    max={maxTimeline}
                  />
                ))}
              </Flex>
            </Card>
            <Card>
              <Heading size="4" mb="3">
                Traffic Sources
              </Heading>
              <Flex direction="column" gap="3">
                {(traffic.data?.sources ?? []).map((source) => (
                  <BarRow
                    key={source.referrer}
                    label={source.referrer}
                    value={source.sessions}
                    max={Math.max(...(traffic.data?.sources ?? []).map((item) => item.sessions), 0)}
                  />
                ))}
                <Separator />
                <Text size="2">
                  New visitors: <strong>{formatNumber(traffic.data?.newVisitors)}</strong> ·
                  Returning visitors:{" "}
                  <strong>{formatNumber(traffic.data?.returningVisitors)}</strong>
                </Text>
                <Text size="2" color="gray">
                  UTM campaigns require schema/ingest support and are not stubbed.
                </Text>
              </Flex>
            </Card>
          </Grid>

          <Grid columns={{ initial: "1", lg: "2" }} gap="5">
            <Card>
              <Heading size="4" mb="3">
                Pages & Content
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
                  {(content.data?.pages ?? []).slice(0, 12).map((page) => (
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
                {(events.data ?? []).map((event) => (
                  <BarRow
                    key={event.type}
                    label={eventLabels[event.type] ?? event.type}
                    value={event.count}
                    max={maxEvents}
                  />
                ))}
              </Flex>
            </Card>
          </Grid>

          <Grid columns={{ initial: "1", lg: "2" }} gap="5">
            <BreakdownCard title="Devices" items={technology.data?.devices ?? []} />
            <BreakdownCard title="Browsers" items={technology.data?.browsers ?? []} />
            <BreakdownCard
              title="Operating Systems"
              items={technology.data?.operatingSystems ?? []}
            />
            <BreakdownCard title="Screen Sizes" items={technology.data?.screens ?? []} />
          </Grid>

          <Card>
            <Flex align="center" gap="2" mb="3">
              <Globe2 size={18} />
              <Heading size="4">Geography</Heading>
            </Flex>
            {geography.data?.isPopulated ? (
              <Grid columns={{ initial: "1", md: "3" }} gap="4">
                {(["countries", "regions", "cities"] as const).map((key) => (
                  <Box key={key}>
                    <Heading size="3" mb="2" className="capitalize">
                      {key}
                    </Heading>
                    <Flex direction="column" gap="2">
                      {geography.data?.[key].map((item) => (
                        <BarRow
                          key={`${key}-${item.label}`}
                          label={item.label}
                          value={item.visitors}
                          max={Math.max(
                            ...(geography.data?.[key] ?? []).map((entry) => entry.visitors),
                            0,
                          )}
                        />
                      ))}
                    </Flex>
                  </Box>
                ))}
              </Grid>
            ) : (
              <Text color="gray">
                No populated country, region, or city session fields were found for this range.
              </Text>
            )}
          </Card>

          <Grid columns={{ initial: "1", xl: "2" }} gap="5">
            <Card>
              <Flex align="center" gap="2" mb="3">
                <Laptop size={18} />
                <Heading size="4">Visitor Analytics</Heading>
              </Flex>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Visitor</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>First</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Last</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Sessions</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Pages</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Duration</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(visitors.data ?? []).map((visitor) => (
                    <Table.Row key={visitor.id}>
                      <Table.Cell>
                        <Button variant="ghost" onClick={() => setSelectedVisitor(visitor)}>
                          {visitor.visitorId}
                        </Button>
                      </Table.Cell>
                      <Table.Cell>{formatDate(visitor.firstVisit)}</Table.Cell>
                      <Table.Cell>{formatDate(visitor.lastVisit)}</Table.Cell>
                      <Table.Cell>{formatNumber(visitor.sessions)}</Table.Cell>
                      <Table.Cell>{formatNumber(visitor.pages)}</Table.Cell>
                      <Table.Cell>{formatDuration(visitor.durationMs)}</Table.Cell>
                      <Table.Cell>
                        <Badge color={visitor.visitorType === "returning" ? "green" : "gray"}>
                          {visitor.visitorType}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              <Text size="2" color="gray" mt="3">
                Online/offline status is deferred until realtime heartbeat semantics are approved.
              </Text>
            </Card>
            <VisitorDetailPanel visitor={selectedVisitor} />
          </Grid>
        </Flex>
      )}
    </Container>
  );
}
