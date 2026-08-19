import { Flex, Select, Text } from "@radix-ui/themes";
import type { AnalyticsRange } from "../analytics.admin.types";

const ranges: { label: string; value: AnalyticsRange; days?: number }[] = [
  { label: "Today", value: "today" },
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "90 days", value: "90d", days: 90 },
];

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

export function AnalyticsFilters({
  range,
  onRangeChange,
}: {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}) {
  return (
    <Flex direction="column" align="end" gap="1">
      <Select.Root value={range} onValueChange={(value) => onRangeChange(value as AnalyticsRange)}>
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
  );
}
