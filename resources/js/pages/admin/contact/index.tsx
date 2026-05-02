import { Head, Link } from '@inertiajs/react';

type Contact = {
  id: string;
  full_name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type Props = {
  contacts: Contact[];
  meta: PaginationMeta;
};

export default function ContactIndex({ contacts, meta }: Props) {
  return (
    <div className="space-y-4 p-6">
      <Head title="Contact Messages" />
      <h1 className="text-2xl font-semibold">Contact Messages</h1>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full divide-y">
          <thead>
            <tr>
              <th className="p-3 text-left">Full Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-sm text-muted-foreground" colSpan={4}>
                  No contact messages found.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="border-t align-top">
                  <td className="p-3">{contact.full_name}</td>
                  <td className="p-3">{contact.email}</td>
                  <td className="p-3 max-w-xl whitespace-pre-wrap">{contact.message}</td>
                  <td className="p-3">{new Date(contact.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>
          Showing page {meta.current_page} of {meta.last_page} ({meta.total} total)
        </p>
        <div className="flex gap-2">
          {meta.current_page > 1 ? <Link href={`?page=${meta.current_page - 1}`}>Previous</Link> : null}
          {meta.current_page < meta.last_page ? <Link href={`?page=${meta.current_page + 1}`}>Next</Link> : null}
        </div>
      </div>
    </div>
  );
}
