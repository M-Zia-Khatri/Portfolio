import { Head, Link, router, usePage } from '@inertiajs/react';

type Skill = { id: number; name: string; icon: string; fileName: string; lang: string; color: string; mode: 'code' | 'terminal' };

export default function SkillsIndex({ skills, filters }: { skills: Skill[]; filters: { mode?: string } }) {
  const flash = usePage().props.flash as { success?: string };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Head title="Skills" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <Link href={route('skills.create')} className="rounded bg-black px-4 py-2 text-white">
          Create
        </Link>
      </div>
      {flash?.success && <p className="mb-4 rounded bg-green-100 p-2 text-green-700">{flash.success}</p>}
      <div className="mb-4">
        <select
          className="rounded border p-2"
          value={filters.mode ?? ''}
          onChange={(event) => router.get(route('skills.index'), { mode: event.target.value || undefined }, { preserveState: true })}
        >
          <option value="">All modes</option>
          <option value="code">Code</option>
          <option value="terminal">Terminal</option>
        </select>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Lang</th>
            <th className="p-2">Mode</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id} className="border-t">
              <td className="p-2">{skill.name}</td>
              <td className="p-2 text-center">{skill.lang}</td>
              <td className="p-2 text-center">{skill.mode}</td>
              <td className="space-x-2 p-2 text-center">
                <Link className="text-blue-600" href={route('skills.edit', skill.id)}>
                  Edit
                </Link>
                <button className="text-red-600" onClick={() => router.delete(route('skills.destroy', skill.id))}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
