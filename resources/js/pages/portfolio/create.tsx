import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import PortfolioForm from './form';

export default function CreatePortfolio() {
  const form = useForm({ siteName: '', siteRole: '', siteUrl: '', siteImage: null as File | null, useTech: [] as string[], description: '' });

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    form.post(route('portfolio.store'), { forceFormData: true });
  };

  return <div className="mx-auto max-w-3xl p-6"><Head title="Create Portfolio" /><h1 className="mb-4 text-2xl font-semibold">Create Portfolio Item</h1><PortfolioForm form={form} submitLabel="Create" onSubmit={onSubmit} /></div>;
}
