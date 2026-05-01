import type { FormEvent } from 'react';
import { Link } from '@inertiajs/react';

type FormShape = {
    data: any;
    setData: any;
    errors: Record<string, string>;
    processing: boolean;
};

export default function SkillForm({ form, submitLabel, onSubmit }: { form: FormShape; submitLabel: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
    return (
        <form onSubmit={onSubmit} className="space-y-3">
            {['name', 'icon', 'file_name', 'lang', 'color'].map((field) => (
                <input key={field} className="w-full rounded border p-2" placeholder={field} value={form.data[field] ?? ''} onChange={(event) => form.setData(field, event.target.value)} />
            ))}
            <select className="w-full rounded border p-2" value={form.data.mode} onChange={(event) => form.setData((data: any) => ({ ...data, mode: event.target.value, code: event.target.value === 'code' ? (data.code ?? ['']) : null, commands: event.target.value === 'terminal' ? (data.commands ?? [{ kind: 'command', text: '' }]) : null }))}>
                <option value="code">code</option><option value="terminal">terminal</option>
            </select>
            {form.data.mode === 'code' ? <textarea className="h-44 w-full rounded border p-2" value={(form.data.code ?? []).join('\n')} onChange={(event) => form.setData('code', event.target.value.split('\n'))} /> : <textarea className="h-44 w-full rounded border p-2" value={JSON.stringify(form.data.commands ?? [{ kind: 'command', text: '' }], null, 2)} onChange={(event) => { try { form.setData('commands', JSON.parse(event.target.value)); } catch {} }} />}
            {Object.keys(form.errors).length > 0 && <p className="text-sm text-red-600">{Object.values(form.errors)[0] as string}</p>}
            <div className="space-x-2"><button type="submit" disabled={form.processing} className="rounded bg-black px-4 py-2 text-white">{form.processing ? 'Saving...' : submitLabel}</button><Link href={route('skills.index')} className="rounded border px-4 py-2">Cancel</Link></div>
        </form>
    );
}
