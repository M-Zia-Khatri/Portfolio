import { Head, Link } from '@inertiajs/react';

type Contact = {
  id: string;
  fullName: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type PaginationMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
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
                  <td className="p-3">{contact.fullName}</td>
                  <td className="p-3">{contact.email}</td>
                  <td className="p-3 max-w-xl whitespace-pre-wrap">{contact.message}</td>
                  <td className="p-3">{new Date(contact.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p>
          Showing page {meta.currentPage} of {meta.lastPage} ({meta.total} total)
        </p>
        <div className="flex gap-2">
          {meta.currentPage > 1 ? <Link href={`?page=${meta.currentPage - 1}`}>Previous</Link> : null}
          {meta.currentPage < meta.lastPage ? <Link href={`?page=${meta.currentPage + 1}`}>Next</Link> : null}
        </div>
      </div>
    </div>
  );
}
