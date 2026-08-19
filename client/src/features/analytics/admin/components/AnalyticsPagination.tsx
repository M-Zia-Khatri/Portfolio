import { Badge, Box, Button, Card, Flex, Grid, Heading, Separator, Spinner, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchVisitorDetail } from "../analytics.admin.api";
import type { VisitorDetail, VisitorSummary } from "../analytics.admin.types";
import { useAnalyticsPagination } from "../hooks/useAnalyticsPagination";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

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

export function AnalyticsPagination({ visitor }: { visitor: VisitorSummary | null }) {
  const { timelineLimit, setTimelineLimit, TIMELINE_PAGE_SIZE } = useAnalyticsPagination();

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
