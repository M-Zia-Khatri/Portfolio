import { cn } from '@/shared/utils/cn';
import { useForm } from '@inertiajs/react';
import { Button, Callout, Dialog, Flex, Spinner, Text, TextArea, TextField } from '@radix-ui/themes';
import { ImageIcon, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { PortfolioFormValues, PortfolioItem } from './portfolio.types';

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: PortfolioItem | null;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="1">
      <Text as="label" size="1" weight="medium" className={cn('text-(--gray-11)')}>
        {label}
      </Text>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Text size="1" className={cn('text-(--red-9)')}>
              {error}
            </Text>
          </motion.div>
        )}
      </AnimatePresence>
    </Flex>
  );
}

function techStringToArray(value: string): string[] {
  return value
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean);
}

export function PortfolioDialog({ open, onOpenChange, editItem }: PortfolioDialogProps) {
  const isEdit = Boolean(editItem);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<PortfolioFormValues>({
    siteName: '',
    siteRole: '',
    siteUrl: '',
    siteImage: null,
    useTech: '',
    description: '',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editItem) {
      setData({
        siteName: editItem.siteName,
        siteRole: editItem.siteRole,
        siteUrl: editItem.siteUrl,
        siteImage: null,
        useTech: editItem.useTech.join(', '),
        description: editItem.description,
      });
      setPreviewUrl(editItem.siteImageUrl);
    } else {
      reset();
      setPreviewUrl(null);
    }

    clearErrors();
    setFormError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [clearErrors, editItem, open, reset, setData]);

  function handleImageChange(file: File | null) {
    setData('siteImage', file);

    if (!file) {
      setPreviewUrl(editItem?.siteImageUrl ?? null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }

      return url;
    });
  }

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    transform((formData) => ({
      siteName: formData.siteName,
      siteRole: formData.siteRole,
      siteUrl: formData.siteUrl,
      ...(formData.siteImage ? { siteImage: formData.siteImage } : {}),
      useTech: techStringToArray(formData.useTech),
      description: formData.description,
      ...(isEdit ? { _method: 'patch' } : {}),
    }));

    post(isEdit && editItem ? route('portfolio.update', editItem.id) : route('portfolio.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
      onError: () => {
        setFormError('Please correct the highlighted fields and try again.');
      },
      onFinish: () => {
        transform((formData) => formData);
      },
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px" className={cn('border border-(--gray-4) bg-(--gray-2)')}>
        <Dialog.Title className={cn('text-(--gray-12)')}>{isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</Dialog.Title>
        <Dialog.Description size="2" className={cn('text-(--gray-10)')}>
          {isEdit ? 'Update the details for this portfolio entry.' : 'Fill in the details to add a new portfolio entry.'}
        </Dialog.Description>

        <form onSubmit={submit}>
          <Flex direction="column" gap="4" mt="4">
            {/* API error */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <TriangleAlert size={14} />
                    </Callout.Icon>
                    <Callout.Text>{formError}</Callout.Text>
                  </Callout.Root>
                </motion.div>
              )}
            </AnimatePresence>

            {/* site_name */}
            <Field label="Site Name *" error={errors.siteName}>
              <TextField.Root
                placeholder="My Awesome Project"
                value={data.siteName}
                onChange={(event) => setData('siteName', event.target.value)}
                className={cn(errors.siteName ? 'border-(--red-7)' : '')}
              />
            </Field>

            {/* site_role */}
            <Field label="Role" error={errors.siteRole}>
              <TextField.Root
                placeholder="Full Stack Developer"
                value={data.siteRole}
                onChange={(event) => setData('siteRole', event.target.value)}
              />
            </Field>

            {/* site_url */}
            <Field label="Site URL *" error={errors.siteUrl}>
              <TextField.Root
                placeholder="https://example.com"
                type="url"
                value={data.siteUrl}
                onChange={(event) => setData('siteUrl', event.target.value)}
                className={cn(errors.siteUrl ? 'border-(--red-7)' : '')}
              />
            </Field>

            {/* site_image */}
            <Field label={isEdit ? 'Image (leave blank to keep current)' : 'Image *'} error={errors.siteImage}>
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2',
                  'cursor-pointer rounded-(--radius-3) border-2 border-dashed p-4',
                  'border-(--gray-6) hover:border-(--blue-7)',
                  'overflow-hidden transition-colors duration-150',
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <AnimatePresence mode="wait">
                  {previewUrl ? (
                    <motion.img
                      key={previewUrl}
                      src={previewUrl}
                      alt="Preview"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className={cn('max-h-32 w-full rounded-(--radius-2) object-cover')}
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn('flex flex-col items-center gap-2')}
                    >
                      <ImageIcon size={24} className={cn('text-(--gray-8)')} />
                      <Text size="1" className={cn('text-(--gray-9)')}>
                        Click to upload image
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="file"
                  accept="image/*"
                  className={cn('hidden')}
                  ref={fileInputRef}
                  onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                />
              </div>
            </Field>

            {/* use_tech */}
            <Field label="Technologies (comma-separated)" error={errors.useTech}>
              <TextField.Root
                placeholder="React, Node.js, PostgreSQL"
                value={data.useTech}
                onChange={(event) => setData('useTech', event.target.value)}
              />
            </Field>

            {/* description */}
            <Field label="Description" error={errors.description}>
              <TextArea
                placeholder="Brief description of the project..."
                rows={3}
                value={data.description}
                onChange={(event) => setData('description', event.target.value)}
              />
            </Field>
          </Flex>

          {/* Actions */}
          <Flex justify="end" gap="3" mt="5">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button" disabled={processing}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={processing} color="blue">
              {processing ? (
                <Flex align="center" gap="2">
                  <Spinner size="1" />
                  {isEdit ? 'Saving…' : 'Adding…'}
                </Flex>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Portfolio'
              )}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
