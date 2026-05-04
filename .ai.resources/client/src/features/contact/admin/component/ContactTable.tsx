import { VirtualList } from '@/shared/components/VirtualList';
import { Table, Text } from '@radix-ui/themes';
import { memo } from 'react';
import type { Contact } from '../../types';

interface Props {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
}

const ROW_HEIGHT = 48;
const MAX_TABLE_HEIGHT = 420;

export const ContactTable = memo(({ contacts, onSelect }: Props) => {
  const listHeight = Math.min(contacts.length * ROW_HEIGHT, MAX_TABLE_HEIGHT);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
      </Table.Root>

      {contacts.length === 0 ? (
        <div className="p-6 text-center">
          <Text color="gray">No contacts found.</Text>
        </div>
      ) : (
        <VirtualList
          items={contacts}
          itemHeight={ROW_HEIGHT}
          height={listHeight}
          renderItem={(contact) => (
            <div key={contact.id} className="border-b border-(--gray-4)">
              <button
                type="button"
                onClick={() => onSelect(contact)}
                className="grid h-12 w-full cursor-pointer grid-cols-3 items-center px-3 text-left hover:bg-(--blue-2)/50"
              >
                <span className="truncate font-medium">{contact.full_name}</span>
                <span className="truncate">{contact.email}</span>
                <span>{new Date(contact.created_at).toLocaleDateString()}</span>
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
});
