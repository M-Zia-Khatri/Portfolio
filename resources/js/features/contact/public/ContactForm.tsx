import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircledIcon, EnvelopeClosedIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import {
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Spinner,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import React, { memo, useOptimistic, useTransition } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { submitContactForm } from '@/features/contact/api';
import { HEADING, TEXT } from '@/shared/constants/style.constants';
import { contactSchema, type ContactFormData } from '../schema/contact.schema';

// --- 1. Atomic Memoized Components ---

const FormLabel = memo(({ children }: { children: React.ReactNode }) => (
  <Text as="label" size={TEXT.base.size} weight="medium">
    {children}
  </Text>
));

const FormErrorMessage = memo(({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <Text size={TEXT.sm.size} color="red">
      {message}
    </Text>
  );
});

const ignoreRegisterRefChange = (prev: any, next: any) => {
  return prev.error === next.error && prev.disabled === next.disabled && prev.label === next.label;
};

const FormInput = memo(
  ({
    label,
    error,
    registration,
    icon: Icon,
    ...props
  }: {
    label: string;
    error?: string;
    registration: UseFormRegisterReturn;
    icon?: React.ElementType;
  } & React.ComponentPropsWithoutRef<typeof TextField.Root>) => (
    <Flex direction="column" gap="1" flexGrow="1">
      <FormLabel>{label}</FormLabel>
      <TextField.Root
        {...props}
        {...registration}
        color={error ? 'red' : props.color}
        aria-invalid={!!error}
      >
        {Icon && (
          <TextField.Slot>
            <Icon width={14} height={14} />
          </TextField.Slot>
        )}
      </TextField.Root>
      <FormErrorMessage message={error} />
    </Flex>
  ),
  ignoreRegisterRefChange,
);

const FormTextAreaField = memo(
  ({
    label,
    error,
    registration,
    ...props
  }: {
    label: string;
    error?: string;
    registration: UseFormRegisterReturn;
  } & React.ComponentPropsWithoutRef<typeof TextArea>) => (
    <Flex direction="column" gap="1">
      <FormLabel>{label}</FormLabel>
      <TextArea
        {...props}
        {...registration}
        color={error ? 'red' : props.color}
        aria-invalid={!!error}
      />
      <FormErrorMessage message={error} />
    </Flex>
  ),
  ignoreRegisterRefChange,
);

const FormCardHeader = memo(() => (
  <div className="space-y-2">
    <Heading as="h3" size={HEADING.h3.size} weight="bold" className="text-white text-center">
      Contact Form
    </Heading>
    <Text size={TEXT.sm.size} weight="medium">
      Please contact me directly at{' '}
      <Text size={TEXT.sm.size} className="font-extrabold text-(--blue-a11)" as="span">
        muhammadziakhatri@gmail.com
      </Text>{' '}
      or drop your info here.
    </Text>
  </div>
));

const FormCardPromise = memo(() => (
  <Text size="1" color="blue" weight="medium">
    I&apos;ll never share your data with anyone else. Pinky promise!
  </Text>
));

const FormCardButton = memo(({ isLoading }: { isLoading: boolean }) => (
  <Button
    type="submit"
    size="3"
    variant="solid"
    disabled={isLoading}
    className="w-full cursor-pointer"
  >
    {isLoading ? (
      <Flex align="center" gap="2">
        <Spinner size="2" /> Sending…
      </Flex>
    ) : (
      <Flex align="center" gap="2">
        Send Message <PaperPlaneIcon width={15} height={15} />
      </Flex>
    )}
  </Button>
));

// --- 2. Memoized Inner Form Logic ---

interface InnerFormProps {
  onSubmit: (data: ContactFormData) => void;
  isLoading: boolean;
  mutation: UseMutationResult<any, any, ContactFormData, any>;
}

const ContactFormInner = memo(({ onSubmit, isLoading, mutation }: InnerFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: '', email: '', message: '' },
  });

  const submitError = mutation.error as AxiosError<{ message?: string }> | null;
  const errorMessage =
    submitError?.response?.data?.message ?? 'Something went wrong. Please try again.';

  return (
    <form className="animate-in fade-in duration-200" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Flex direction="column" gap="4">
        <Flex direction={{ initial: 'column', sm: 'row' }} gap="4">
          <FormInput
            label="Full name"
            placeholder="Your Name"
            registration={register('fullName')}
            error={errors.fullName?.message}
            disabled={isLoading}
          />
          <FormInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            registration={register('email')}
            error={errors.email?.message}
            disabled={isLoading}
            icon={EnvelopeClosedIcon}
          />
        </Flex>

        <FormTextAreaField
          label="Your Message"
          rows={5}
          placeholder="Tell me about your project,"
          registration={register('message')}
          error={errors.message?.message}
          disabled={isLoading}
        />

        {mutation.isError && (
          <Callout.Root color="red" variant="surface" size="1">
            <Callout.Text>{errorMessage}</Callout.Text>
          </Callout.Root>
        )}

        <FormCardPromise />
        <FormCardButton isLoading={isLoading} />
      </Flex>
    </form>
  );
});

// --- 3. Main Component (The Card Wrapper) ---

function ContactFormCard() {
  const [isPendingTransition, startTransition] = useTransition();

  const mutation = useMutation({
    mutationFn: submitContactForm,
  });

  const [optimisticSuccess, setOptimisticSuccess] = useOptimistic(
    false,
    (_, newState: boolean) => newState,
  );

  const onSubmit = (data: ContactFormData) => {
    startTransition(async () => {
      try {
        setOptimisticSuccess(true);
        await mutation.mutateAsync(data);
      } catch {
        // Handled by mutation error state
      }
    });
  };

  const handleResetForm = () => {
    mutation.reset();
  };

  const isLoading = mutation.isPending || isPendingTransition;
  const showSuccess = (optimisticSuccess && !mutation.isError) || mutation.isSuccess;

  return (
    <Card size="3">
      <FormCardHeader />
      <Separator my="4" size="4" />

      {showSuccess ? (
        <div key="success" className="animate-in fade-in zoom-in-95 duration-300">
          <Callout.Root color="green" variant="surface" size="2">
            <Callout.Icon>
              <CheckCircledIcon width={18} height={18} />
            </Callout.Icon>
            <Callout.Text>Your message was sent! I&apos;ll get back to you soon.</Callout.Text>
          </Callout.Root>
          <Button mt="4" variant="ghost" size="2" onClick={handleResetForm}>
            Send another message
          </Button>
        </div>
      ) : (
        <ContactFormInner onSubmit={onSubmit} isLoading={isLoading} mutation={mutation} />
      )}
    </Card>
  );
}

export default memo(ContactFormCard);
