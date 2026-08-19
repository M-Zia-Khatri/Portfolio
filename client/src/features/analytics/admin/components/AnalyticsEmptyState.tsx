import { Flex, Text } from "@radix-ui/themes";

export function EmptyState({ children = "No data yet." }: { children?: string }) {
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

export function BarRow({
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
        <Text weight="bold">{new Intl.NumberFormat().format(value)}</Text>
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
        {new Intl.NumberFormat().format(value)}
      </Text>
    </div>
  );
}
