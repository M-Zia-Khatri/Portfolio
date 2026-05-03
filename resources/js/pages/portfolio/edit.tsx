import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import PortfolioForm from './form';

type PortfolioItem = { id: string; siteName: string; siteRole: string; siteUrl: string; siteImageUrl: string; useTech: string[]; description: string };

export default function EditPortfolio({ portfolioItem }: { portfolioItem: PortfolioItem }) {
  const form = useForm({ siteName: portfolioItem.siteName, siteRole: portfolioItem.siteRole, siteUrl: portfolioItem.siteUrl, siteImage: null as File | null, useTech: portfolioItem.useTech, description: portfolioItem.description });

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    form.transform((data) => ({
      ...data,
      _method: 'put',
    }));

    form.post(route('portfolio.update', portfolioItem.id), {
      forceFormData: true,
    });
  };

  return <div className="mx-auto max-w-3xl p-6"><Head title="Edit Portfolio" /><h1 className="mb-4 text-2xl font-semibold">Edit Portfolio Item</h1><PortfolioForm form={form} submitLabel="Update" onSubmit={onSubmit} /></div>;
}
