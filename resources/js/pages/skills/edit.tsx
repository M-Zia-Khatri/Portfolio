import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import SkillForm from './skill-form';

export default function SkillsEdit({ skill }: { skill: any }) {
  const form = useForm({ ...skill, code: skill.code ?? null, commands: skill.commands ?? null });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.patch(route('skills.update', skill.id));
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Head title="Edit Skill" />
      <h1 className="mb-4 text-2xl font-semibold">Edit Skill</h1>
      <SkillForm form={form} submitLabel="Update" onSubmit={onSubmit} />
    </div>
  );
}
