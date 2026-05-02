import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';
import { route } from 'ziggy-js';

type WelcomePageProps = SharedData & {
  flash?: {
    success?: string;
  };
};

type ContactFormData = {
  full_name: string;
  email: string;
  message: string;
  image_url: string;
};

export default function Welcome() {
  const { flash } = usePage<WelcomePageProps>().props;
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const cloudinaryConfig = useMemo(() => {
    return {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined,
    };
  }, []);

  const { data, setData, post, processing, errors, reset } = useForm<ContactFormData>({
    full_name: '',
    email: '',
    message: '',
    image_url: '',
  });

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      throw new Error('Cloudinary is not configured for client uploads.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image upload failed.');
    }

    const payload = (await response.json()) as { secure_url?: string };

    if (!payload.secure_url) {
      throw new Error('Cloudinary response did not include secure_url.');
    }

    return payload.secure_url;
  };

  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setData('image_url', '');
      return;
    }

    setUploadingImage(true);
    setImageUploadError(null);

    try {
      const secureUrl = await uploadImageToCloudinary(selectedFile);
      setData('image_url', secureUrl);
    } catch (error) {
      setData('image_url', '');
      setImageUploadError(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const submit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    post(route('contact.submit'), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setImageUploadError(null);
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
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                value={data.full_name}
                onChange={(event) => setData('full_name', event.target.value)}
                autoComplete="name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-0"
              />
              {errors.full_name ? <p className="mt-1 text-sm text-red-600">{errors.full_name}</p> : null}
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

            <div>
              <label htmlFor="image" className="mb-1.5 block text-sm font-medium text-gray-700">
                Image (optional)
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploadingImage || processing}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-4 file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              {uploadingImage ? <p className="mt-1 text-sm text-gray-600">Uploading image…</p> : null}
              {imageUploadError ? <p className="mt-1 text-sm text-red-600">{imageUploadError}</p> : null}
              {errors.image_url ? <p className="mt-1 text-sm text-red-600">{errors.image_url}</p> : null}
              {data.image_url ? (
                <div className="mt-3">
                  <img src={data.image_url} alt="Uploaded preview" className="max-h-48 rounded-md border border-gray-300" />
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={processing || uploadingImage}
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
