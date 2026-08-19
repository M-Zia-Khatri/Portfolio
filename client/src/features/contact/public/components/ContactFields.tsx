import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { Flex, Text, TextField } from "@radix-ui/themes";
import { memo } from "react";
import type React from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { TEXT } from "@/shared/constants/style.constants";

export const FormLabel = memo(({ children }: { children: React.ReactNode }) => (
  <Text as="label" size={TEXT.base.size} weight="medium">
    {children}
  </Text>
));

export const FormErrorMessage = memo(({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <Text size={TEXT.sm.size} color="red">
      {message}
    </Text>
  );
});

export const ignoreRegisterRefChange = (
  prevProps: { registration: UseFormRegisterReturn },
  nextProps: { registration: UseFormRegisterReturn },
) => {
  const prev = prevProps.registration;
  const next = nextProps.registration;
  return prev.name === next.name && prev.disabled === next.disabled;
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
        color={error ? "red" : props.color}
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

export function ContactFields({
  register,
  errors,
  isLoading,
}: {
  register: (name: "fullName" | "email") => UseFormRegisterReturn;
  errors: { fullName?: { message?: string }; email?: { message?: string } };
  isLoading: boolean;
}) {
  return (
    <Flex direction={{ initial: "column", sm: "row" }} gap="4">
      <FormInput
        label="Full name"
        placeholder="Your Name"
        registration={register("fullName")}
        error={errors.fullName?.message}
        disabled={isLoading}
      />
      <FormInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        registration={register("email")}
        error={errors.email?.message}
        disabled={isLoading}
        icon={EnvelopeClosedIcon}
      />
    </Flex>
  );
}
