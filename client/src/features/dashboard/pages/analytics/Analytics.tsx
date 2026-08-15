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
import { Activity, Globe2, Laptop, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { AnalyticsRange, BreakdownItem, VisitorDetail, VisitorSummary } from "./types";

const TIMELINE_PAGE_SIZE = 30;
const BOUNCE_RATE_MIN_SESSIONS = 5;

const ranges: { label: string; value: AnalyticsRange; days?: number }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "90 days", value: "90d", days: 90 },
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
  session_start: "Session Started",
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

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function getAppliedRangeLabel(range: AnalyticsRange) {
  const end = new Date();
  const start = new Date(end);
  if (range === "today") {
    start.setHours(0, 0, 0, 0);
  } else {
    const selected = ranges.find((item) => item.value === range);
    start.setDate(end.getDate() - (selected?.days ?? 30));
  }
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

function BarRow({
  label,
  value,
  max,
  showBar = true,
}: {
  label: string;
  value: number;
  max: number;
  showBar?: boolean;
}) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  if (!showBar) {
    return (
      <Flex align="center" justify="between" gap="3" className="rounded-md bg-(--gray-2) px-3 py-2">
        <Text truncate size="2">
          {label}
        </Text>
        <Text weight="bold">{formatNumber(value)}</Text>
      </Flex>
    );
  }

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

function EmptyState({ children = "No data yet." }: { children?: string }) {
  return (
    <Text
      size="2"
      color="gray"
      className="rounded-md border border-dashed border-(--gray-5) px-3 py-2"
    >
      {children}
    </Text>
  );
}

function BreakdownCard({ title, items }: { title: string; items: BreakdownItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 0);
  const showBars = items.length > 1;
  return (
    <Card>
      <Heading size="4" mb="3">
        {title}
      </Heading>
      <Flex direction="column" gap="3">
        {items.length ? (
          items.map((item) => (
            <BarRow
              key={item.label}
              label={item.label}
              value={item.count}
              max={max}
              showBar={showBars}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </Flex>
    </Card>
  );
}

type CollapsedTimelineItem = VisitorDetail["timeline"][number] & { count: number };

function collapseTimeline(items: VisitorDetail["timeline"]): CollapsedTimelineItem[] {
  return items.reduce<CollapsedTimelineItem[]>((acc, item) => {
    const previous = acc.at(-1);
    if (previous && previous.type === item.type && previous.path === item.path) {
      previous.count += 1;
      return acc;
    }
    acc.push({ ...item, count: 1 });
    return acc;
  }, []);
}

function TimelineBullet({ type }: { type: string }) {
  const color = type === "session_start" ? "bg-(--blue-9)" : "bg-(--gray-9)";
  return <span className={`mt-1.5 size-2 shrink-0 rounded-full ${color}`} aria-hidden="true" />;
}

function VisitorDetailPanel({ visitor }: { visitor: VisitorSummary | null }) {
  const [timelineLimit, setTimelineLimit] = useState(TIMELINE_PAGE_SIZE);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["analytics", "visitor", visitor?.id, timelineLimit],
    queryFn: () => fetchVisitorDetail(visitor?.id ?? "", { limit: timelineLimit, offset: 0 }),
    enabled: Boolean(visitor?.id),
  });

  const collapsedTimeline = useMemo(() => collapseTimeline(data?.timeline ?? []), [data?.timeline]);

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
        {collapsedTimeline.map((item) => (
          <Flex
            key={`${item.id}-${item.count}`}
            justify="between"
            gap="3"
            className="rounded-md bg-(--gray-2) px-3 py-2"
          >
            <Flex gap="2" align="start">
              <TimelineBullet type={item.type} />
              <Text size="2">
                {eventLabels[item.type] ?? item.type}
                {item.path ? ` · ${item.path}` : ""}
                {item.count > 1 ? ` ×${item.count}` : ""}
              </Text>
            </Flex>
            <Text size="2" color="gray" className="shrink-0">
              {formatDate(item.timestamp)}
            </Text>
          </Flex>
        ))}
      </Flex>
      {data.pagination?.hasMore ? (
        <Button
          mt="3"
          variant="soft"
          loading={isFetching}
          onClick={() => setTimelineLimit((limit) => limit + TIMELINE_PAGE_SIZE)}
        >
          Load more activity
        </Button>
      ) : null}
    </Card>
  );
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
  const sources = traffic.data?.sources ?? [];
  const eventCounts = events.data ?? [];
  const maxTimeline = Math.max(...topTimeline.map((point) => point.pageViews), 0);
  const maxSources = Math.max(...sources.map((item) => item.sessions), 0);
  const maxEvents = Math.max(...eventCounts.map((event) => event.count), 0);
  const overviewData = overview.data;
  const bounceRateValue =
    (overviewData?.totalSessions ?? 0) >= BOUNCE_RATE_MIN_SESSIONS
      ? formatPercent(overviewData?.bounceRate)
      : "N/A";
  const bounceRateHelper =
    (overviewData?.totalSessions ?? 0) >= BOUNCE_RATE_MIN_SESSIONS
      ? `${formatNumber(overviewData?.totalSessions)} sessions sampled`
      : `Insufficient data — needs ${BOUNCE_RATE_MIN_SESSIONS}+ sessions`;

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
        <Flex direction="column" align="end" gap="1">
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
          <Text size="2" color="gray">
            Applied range: {getAppliedRangeLabel(range)}
          </Text>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex justify="center" p="9">
          <Spinner size="3" />
        </Flex>
      ) : null}

      {!isLoading && (
        <Flex direction="column" gap="6">
          <Card>
            <Flex align="center" gap="2" mb="4">
              <Users size={18} />
              <Heading size="4">Overview</Heading>
            </Flex>
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
            <Flex align="center" gap="2" mb="4">
              <Activity size={18} />
              <Heading size="4">Engagement</Heading>
            </Flex>
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
                  New visitors: <strong>{formatNumber(traffic.data?.newVisitors)}</strong> ·
                  Returning visitors:{" "}
                  <strong>{formatNumber(traffic.data?.returningVisitors)}</strong>
                </Text>
                <EmptyState>No UTM campaign data yet.</EmptyState>
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
                {eventCounts.length ? (
                  eventCounts.map((event) => (
                    <BarRow
                      key={event.type}
                      label={eventLabels[event.type] ?? event.type}
                      value={event.count}
                      max={maxEvents}
                      showBar={eventCounts.length > 1}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
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
                {(["countries", "regions", "cities"] as const).map((key) => {
                  const items = geography.data?.[key] ?? [];
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
              <EmptyState>Online status data is not available yet.</EmptyState>
            </Card>
            <VisitorDetailPanel key={selectedVisitor?.id ?? "empty"} visitor={selectedVisitor} />
          </Grid>
        </Flex>
      )}
    </Container>
  );
}
