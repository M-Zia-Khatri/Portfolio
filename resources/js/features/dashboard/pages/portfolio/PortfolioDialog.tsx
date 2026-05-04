import { cn } from '@/shared/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Callout,
  Dialog,
  Flex,
  Spinner,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { ImageIcon, TriangleAlert } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { uploadToCloudinary } from './portfolio.api';
import type { PortfolioFormValues, PortfolioItem } from './portfolio.types';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  site_role: z.string().optional(),
  site_url: z.string().url('Enter a valid URL'),
  site_image: z.custom<FileList>((v) => v instanceof FileList && v.length > 0, 'Image is required'),
  use_tech: z.string().optional(),
  description: z.string().optional(),
});

const editSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  site_role: z.string().optional(),
  site_url: z.string().url('Enter a valid URL'),
  site_image: z.custom<FileList>().optional(),
  use_tech: z.string().optional(),
  description: z.string().optional(),
});

// type CreateSchema = z.infer<typeof createSchema>
// type EditSchema = z.infer<typeof editSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: PortfolioItem | null;
  onSubmit: (data: Omit<PortfolioItem, 'id'>, id?: string) => Promise<void>;
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function PortfolioDialog({ open, onOpenChange, editItem, onSubmit }: PortfolioDialogProps) {
  // console.log(editItem)
  const isEdit = Boolean(editItem);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PortfolioFormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema) as any,
    defaultValues: {
      site_name: '',
      site_role: '',
      site_url: '',
      use_tech: '',
      description: '',
    },
  });

  // ─── Populate on edit / clear on add ──────────────────────────────────────

  useEffect(() => {
    if (editItem) {
      reset({
        site_name: editItem.site_name,
        site_role: editItem.site_role,
        site_url: editItem.site_url,
        use_tech: editItem.use_tech.join(', '),
        description: editItem.description,
      });
      setPreviewUrl(editItem.site_image_url);
    } else {
      reset({
        site_name: '',
        site_role: '',
        site_url: '',
        use_tech: '',
        description: '',
      });
      setPreviewUrl(null);
    }
    setApiError(null);
  }, [editItem, open, reset]);

  // ─── Live file preview ────────────────────────────────────────────────────

  const watchedImage = watch('site_image');
  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const url = URL.createObjectURL(watchedImage[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const onFormSubmit = async (values: PortfolioFormValues) => {
    setSubmitting(true);
    setApiError(null);

    try {
      let site_image_url = editItem?.site_image_url ?? '';

      if (values.site_image && values.site_image.length > 0) {
        site_image_url = await uploadToCloudinary(values.site_image[0]);
      }

      await onSubmit(
        {
          site_name: values.site_name,
          site_role: values.site_role ?? '',
          site_url: values.site_url,
          site_image_url,
          use_tech: (values.use_tech ?? '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          description: values.description ?? '',
        },
        editItem?.id,
      );

      onOpenChange(false);
    } catch (err: any) {
      setApiError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const { ref: imageRefCallback, ...imageRegisterRest } = register('site_image');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px" className={cn('bg-(--gray-2) border border-(--gray-4)')}>
        <Dialog.Title className={cn('text-(--gray-12)')}>
          {isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
        </Dialog.Title>
        <Dialog.Description size="2" className={cn('text-(--gray-10)')}>
          {isEdit
            ? 'Update the details for this portfolio entry.'
            : 'Fill in the details to add a new portfolio entry.'}
        </Dialog.Description>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Flex direction="column" gap="4" mt="4">
            {/* API error */}
            <AnimatePresence>
              {apiError && (
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
                    <Callout.Text>{apiError}</Callout.Text>
                  </Callout.Root>
                </motion.div>
              )}
            </AnimatePresence>

            {/* site_name */}
            <Field label="Site Name *" error={errors.site_name?.message}>
              <TextField.Root
                placeholder="My Awesome Project"
                {...register('site_name')}
                className={cn(errors.site_name ? 'border-(--red-7)' : '')}
              />
            </Field>

            {/* site_role */}
            <Field label="Role" error={errors.site_role?.message}>
              <TextField.Root placeholder="Full Stack Developer" {...register('site_role')} />
            </Field>

            {/* site_url */}
            <Field label="Site URL *" error={errors.site_url?.message}>
              <TextField.Root
                placeholder="https://example.com"
                type="url"
                {...register('site_url')}
                className={cn(errors.site_url ? 'border-(--red-7)' : '')}
              />
            </Field>

            {/* site_image */}
            <Field
              label={isEdit ? 'Image (leave blank to keep current)' : 'Image *'}
              error={(errors.site_image as any)?.message}
            >
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center gap-2',
                  'border-2 border-dashed rounded-(--radius-3) p-4 cursor-pointer',
                  'border-(--gray-6) hover:border-(--blue-7)',
                  'transition-colors duration-150 overflow-hidden',
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
                      className={cn('w-full max-h-32 object-cover rounded-(--radius-2)')}
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
                  {...imageRegisterRest}
                  ref={(el) => {
                    imageRefCallback(el);
                    fileInputRef.current = el;
                  }}
                />
              </div>
            </Field>

            {/* use_tech */}
            <Field label="Technologies (comma-separated)" error={errors.use_tech?.message}>
              <TextField.Root placeholder="React, Node.js, PostgreSQL" {...register('use_tech')} />
            </Field>

            {/* description */}
            <Field label="Description" error={errors.description?.message}>
              <TextArea
                placeholder="Brief description of the project..."
                rows={3}
                {...register('description')}
              />
            </Field>
          </Flex>

          {/* Actions */}
          <Flex justify="end" gap="3" mt="5">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button" disabled={submitting}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={submitting} color="blue">
              {submitting ? (
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
