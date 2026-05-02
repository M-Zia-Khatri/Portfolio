import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import PortfolioForm from './form';

type PortfolioItem = { id: string; siteName: string; siteRole: string; siteUrl: string; siteImageUrl: string; useTech: string[]; description: string };

export default function EditPortfolio({ portfolioItem }: { portfolioItem: PortfolioItem }) {
  const form = useForm({ site_name: portfolioItem.siteName, site_role: portfolioItem.siteRole, site_url: portfolioItem.siteUrl, site_image: null as File | null, use_tech: portfolioItem.useTech, description: portfolioItem.description });
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); form.post(route('portfolio.update', portfolioItem.id), { method: 'put' }); };
  return <div className="mx-auto max-w-3xl p-6"><Head title="Edit Portfolio" /><h1 className="mb-4 text-2xl font-semibold">Edit Portfolio Item</h1><PortfolioForm form={form} submitLabel="Update" onSubmit={onSubmit} /></div>;
}
