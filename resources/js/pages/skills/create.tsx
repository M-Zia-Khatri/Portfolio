import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import SkillForm from './skill-form';

export default function SkillsCreate() {
  const form = useForm({ name: '', icon: '', fileName: '', lang: '', color: '', mode: 'code', code: [''], commands: null });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.post(route('skills.store'));
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Head title="Create Skill" />
      <h1 className="mb-4 text-2xl font-semibold">Create Skill</h1>
      <SkillForm form={form} submitLabel="Create" onSubmit={onSubmit} />
    </div>
  );
}
