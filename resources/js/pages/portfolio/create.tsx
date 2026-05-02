import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import PortfolioForm from './form';

export default function CreatePortfolio() {
  const form = useForm({ site_name: '', site_role: '', site_url: '', site_image: null as File | null, use_tech: [] as string[], description: '' });
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); form.post(route('portfolio.store')); };
  return <div className="mx-auto max-w-3xl p-6"><Head title="Create Portfolio" /><h1 className="mb-4 text-2xl font-semibold">Create Portfolio Item</h1><PortfolioForm form={form} submitLabel="Create" onSubmit={onSubmit} /></div>;
}
