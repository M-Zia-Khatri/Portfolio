import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Text, TextField } from '@radix-ui/themes';

interface Props {
  value: string;
  onChange: (val: string) => void;
  resultsCount: number;
}

export const ContactFilters = ({ value, onChange, resultsCount }: Props) => (
  <Flex justify="between" align="center" mb="4">
    <TextField.Root
      placeholder="Search name, email, or message..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: '350px' }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
      </TextField.Slot>
    </TextField.Root>
    <Text size="2" color="gray">
      {resultsCount} contacts found
    </Text>
  </Flex>
);
