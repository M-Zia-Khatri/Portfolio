import { Card, Flex, Heading } from "@radix-ui/themes";
import type { BreakdownItem } from "../analytics.admin.types";
import { BarRow, EmptyState } from "./AnalyticsEmptyState";

export function AnalyticsChart({ title, items }: { title: string; items: BreakdownItem[] }) {
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
