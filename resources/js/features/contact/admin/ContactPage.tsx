import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import SEO from '@/shared/components/SEO';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Box, Callout, Flex, Heading, Spinner } from '@radix-ui/themes';
import { useCallback, useMemo, useState } from 'react';
import { useContacts, useDeleteContact } from '../api';
import type { Contact } from '../types';
import { ContactDetails } from './component/ContactDetails';
import { ContactFilters } from './component/ContactFilters';
import { ContactTable } from './component/ContactTable';

export default function ContactPage() {
  const { data: contacts, isLoading, isError, error } = useContacts();
  const deleteMutation = useDeleteContact();

  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const debouncedSearch = useDebouncedValue(search, 250);

  const filteredContacts = useMemo(() => {
    if (!contacts || !Array.isArray(contacts)) return [];

    const q = debouncedSearch.toLowerCase();
    if (!q) return contacts;

    return contacts.filter((c) => {
      const name = c.full_name?.toLowerCase() || '';
      const email = c.email?.toLowerCase() || '';
      const message = c.message?.toLowerCase() || '';

      return name.includes(q) || email.includes(q) || message.includes(q);
    });
  }, [contacts, debouncedSearch]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Are you sure?')) {
        await deleteMutation.mutateAsync(id);
        setSelectedContact(null);
      }
    },
    [deleteMutation],
  );

  const handleSelect = useCallback((contact: Contact) => setSelectedContact(contact), []);

  if (isLoading)
    return (
      <Flex p="9" justify="center">
        <Spinner size="3" />
      </Flex>
    );

  if (isError)
    return (
      <Box p="6">
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{error instanceof Error ? error.message : 'Failed to fetch'}</Callout.Text>
        </Callout.Root>
      </Box>
    );

  return (
    <>
      <SEO
        title="Contact Submissions | Admin Dashboard"
        description="View and manage contact form submissions from your portfolio visitors. Admin dashboard for reviewing messages and contacting leads."
        canonical="https://zia-khatri.vercel.app/admin/contact"
        robots="noindex, nofollow"
      />
      <Box p="6">
        <Heading mb="4">Contact Submissions</Heading>

      <ContactFilters value={search} onChange={setSearch} resultsCount={filteredContacts.length} />

      <ContactTable contacts={filteredContacts} onSelect={handleSelect} />

      <ContactDetails
        contact={selectedContact}
        isOpen={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
    </>
  );
}
