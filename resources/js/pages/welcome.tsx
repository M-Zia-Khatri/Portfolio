import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { route } from 'ziggy-js';

type WelcomePageProps = SharedData & {
  flash?: {
    success?: string;
  };
};

type ContactFormData = {
  fullName: string;
  email: string;
  message: string;
};

export default function Welcome() {
  const { flash } = usePage<WelcomePageProps>().props;

  const { data, setData, post, processing, errors, reset } = useForm<ContactFormData>({
    fullName: '',
    email: '',
    message: '',
  });

  const submit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    post(route('contact.submit'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <>
      <Head title="Contact" />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <section className="rounded-md border border-gray-300 bg-white p-6 sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Contact us</h1>
            <p className="mt-2 text-sm text-gray-600">Send us a message and we will get back to you.</p>
          </header>

          {flash?.success ? (
            <div className="mb-6 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">{flash.success}</div>
          ) : null}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={data.fullName}
                onChange={(event) => setData('fullName', event.target.value)}
                autoComplete="name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-0"
              />
              {errors.fullName ? <p className="mt-1 text-sm text-red-600">{errors.fullName}</p> : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={(event) => setData('email', event.target.value)}
                autoComplete="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-0"
              />
              {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                value={data.message}
                onChange={(event) => setData('message', event.target.value)}
                rows={5}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-0"
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : <span />}
                <p className="text-xs text-gray-500">{data.message.length} characters</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center rounded-md border border-gray-900 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
            >
              {processing ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
