import type { Contact } from '@/features/contact/types';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import type { ContactMessagesPageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Box, Heading } from '@radix-ui/themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Layout';
import { ContactDetails } from './component/ContactDetails';
import { ContactFilters } from './component/ContactFilters';
import { ContactTable } from './component/ContactTable';

function ContactPage() {
  const { contacts = [], meta } = usePage<ContactMessagesPageProps>().props;
  const paginatedContacts = useMemo(() => contacts.slice(0, meta.perPage), [contacts, meta.perPage]);

  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 250);

  const filteredContacts = useMemo(() => {
    const q = debouncedSearch.toLowerCase();

    if (!q) {
      return paginatedContacts;
    }

    return paginatedContacts.filter((contact) => {
      const name = contact.fullName.toLowerCase();
      const email = contact.email.toLowerCase();
      const message = contact.message.toLowerCase();

      return name.includes(q) || email.includes(q) || message.includes(q);
    });
  }, [paginatedContacts, debouncedSearch]);

  useEffect(() => {
    setSelectedContact((currentContact) => {
      if (!currentContact) {
        return null;
      }

      return paginatedContacts.find((contact) => contact.id === currentContact.id) ?? null;
    });
  }, [paginatedContacts]);

  const handleDelete = useCallback((id: string) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }

    router.delete(route('admin.contact.destroy', id), {
      preserveScroll: true,
      onStart: () => {
        setIsDeleting(true);
      },
      onSuccess: () => {
        setSelectedContact(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  }, []);

  const handleSelect = useCallback((contact: Contact) => {
    setSelectedContact(contact);
  }, []);

  return (
    <>
      <Box p="6">
        <Heading mb="4">Contact Submissions</Heading>

        <ContactFilters value={search} onChange={setSearch} resultsCount={filteredContacts.length} />

        <ContactTable contacts={filteredContacts} onSelect={handleSelect} />

        <ContactDetails
          contact={selectedContact}
          isOpen={!!selectedContact}
          onOpenChange={(open) => !open && setSelectedContact(null)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </Box>
    </>
  );
}

ContactPage.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default ContactPage;
