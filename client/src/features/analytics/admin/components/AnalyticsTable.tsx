import { Card, Flex, Heading, Table } from "@radix-ui/themes";
import { Laptop } from "lucide-react";
import type { VisitorSummary } from "../analytics.admin.types";
import { EmptyState } from "./AnalyticsEmptyState";
import { AnalyticsTableRow } from "./AnalyticsTableRow";

export function AnalyticsTable({
  visitors,
  onSelectVisitor,
}: {
  visitors: VisitorSummary[];
  onSelectVisitor: (v: VisitorSummary) => void;
}) {
  return (
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
          {visitors.map((visitor) => (
            <AnalyticsTableRow key={visitor.id} visitor={visitor} onSelect={onSelectVisitor} />
          ))}
        </Table.Body>
      </Table.Root>
      <EmptyState>Online status data is not available yet.</EmptyState>
    </Card>
  );
}
