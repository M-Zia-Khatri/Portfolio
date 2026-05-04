import { Badge, Table, Text } from '@radix-ui/themes';
import { memo, useEffect, useRef } from 'react';
import type { ScoreRecord } from '../store/GameSetStore';

interface ScoreRowProps {
  record: ScoreRecord;
  idx: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (newName: string) => void;
}

function ScoreRow({ record, idx, isEditing, onCancel, onSave }: ScoreRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Table.Row
      style={{
        background:
          record.result === 'win'
            ? 'color-mix(in srgb, var(--green-a3) 60%, transparent)'
            : 'color-mix(in srgb, var(--red-a3) 60%, transparent)',
      }}
    >
      <Table.Cell>
        <Text size="1" className="font-mono" style={{ color: 'var(--gray-10)' }}>
          {idx + 1}
        </Text>
      </Table.Cell>

      <Table.Cell>
        {isEditing ? (
          <input
            ref={inputRef}
            defaultValue={record.name}
            onBlur={(e) => {
              const newName = e.target.value.trim();
              if (newName !== record.name) onSave(newName);
              else onCancel();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(e.currentTarget.value.trim());
              if (e.key === 'Escape') onCancel();
            }}
            className="w-full max-w-30 rounded px-2 py-0.5 text-center text-xs"
            style={{
              // background: 'var(--gray-3)',
              border: '1px solid var(--blue-7)',
              color: 'var(--gray-12)',
              outline: 'none',
            }}
          />
        ) : (
          <Text
            className="max-w-30 cursor-pointer truncate text-left text-xs font-medium capitalize"
            style={{ color: 'var(--blue-11)' }}
          >
            {record.name || <span style={{ color: 'var(--gray-9)', fontStyle: 'italic' }}>—</span>}
          </Text>
        )}
      </Table.Cell>

      <Table.Cell>
        <Text size="1" weight="bold" style={{ color: 'var(--gray-12)' }}>
          {Math.round(record.score)}
        </Text>
      </Table.Cell>

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

      <Table.Cell>
        <Text size="1" className="font-mono" style={{ color: 'var(--gray-10)' }}>
          {record.difficultLevel}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

const MemoizedScoreRow = memo(ScoreRow, (prev, next) => {
  return (
    prev.record.name === next.record.name &&
    prev.record.score === next.record.score &&
    prev.record.result === next.record.result &&
    prev.record.difficultLevel === next.record.difficultLevel &&
    prev.isEditing === next.isEditing &&
    prev.idx === next.idx
  );
});

export default MemoizedScoreRow;
