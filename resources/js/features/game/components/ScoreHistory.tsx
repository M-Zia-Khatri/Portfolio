import * as Table from '@radix-ui/themes/components/table';
import { Badge, Text } from '@radix-ui/themes';
import { memo, useDeferredValue, useMemo } from 'react';
import useGameSet, { type ScoreRecord } from '../store/GameSetStore';

const MAX_HEIGHT = 360;

type RowProps = {
  record: ScoreRecord;
  index: number;
};

const ScoreHistoryRow = memo(function ScoreHistoryRow({
  record,
  index,
}: RowProps) {
  return (
    <Table.Row>
      {/* Index */}
      <Table.Cell>{index + 1}</Table.Cell>

      {/* Name */}
      <Table.Cell>
        <span className="block truncate">
          {record.name?.trim() || '—'}
        </span>
      </Table.Cell>

      {/* Score */}
      <Table.Cell>
        <span className="font-semibold">
          {Math.round(record.score)}
        </span>
      </Table.Cell>

      {/* Result */}
      <Table.Cell>
        <Badge
          color={record.result === 'win' ? 'green' : 'red'}
          variant="soft"
          radius="full"
          size="1"
        >
          {record.result}
        </Badge>
      </Table.Cell>
    </Table.Row>
  );
});

export default function ScoreHistory() {
  const scoreHistory = useGameSet((state) => state.scoreHistory);
  const deferredHistory = useDeferredValue(scoreHistory);
  const rows = useMemo(
    () =>
      deferredHistory.map((record, index) => (
        <ScoreHistoryRow
          key={record.id}
          record={record}
          index={index}
        />
      )),
    [deferredHistory],
  );

  // Empty state
  if (!deferredHistory.length) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--gray-3)' }}
      >
        <Text
          size="2"
          style={{ color: 'var(--gray-10)' }}
          className="italic"
        >
          No games played yet.
        </Text>
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto rounded-xl border border-(--gray-5)"
      style={{ maxHeight: MAX_HEIGHT }}
    >
      <Table.Root>
        {/* Header */}
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Score</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Result</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        {/* Body */}
        <Table.Body>
          {rows}
        </Table.Body>
      </Table.Root>
    </div>
  );
}