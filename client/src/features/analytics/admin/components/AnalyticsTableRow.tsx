import { Badge, Button, Table } from "@radix-ui/themes";
import type { VisitorSummary } from "../analytics.admin.types";

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

export function AnalyticsTableRow({
  visitor,
  onSelect,
}: {
  visitor: VisitorSummary;
  onSelect: (v: VisitorSummary) => void;
}) {
  return (
    <Table.Row key={visitor.id}>
      <Table.Cell>
        <Button variant="ghost" onClick={() => onSelect(visitor)}>
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
  );
}
