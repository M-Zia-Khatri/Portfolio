import { Flex, TextArea } from "@radix-ui/themes";
import type React from "react";
import { memo } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormErrorMessage, FormLabel, ignoreRegisterRefChange } from "./ContactFields";

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
        color={error ? "red" : props.color}
        aria-invalid={!!error}
      />
      <FormErrorMessage message={error} />
    </Flex>
  ),
  ignoreRegisterRefChange,
);

export function ContactMessageField({
  registration,
  error,
  isLoading,
}: {
  registration: UseFormRegisterReturn;
  error?: string;
  isLoading: boolean;
}) {
  return (
    <FormTextAreaField
      label="Your Message"
      rows={5}
      placeholder="Tell me about your project,"
      registration={registration}
      error={error}
      disabled={isLoading}
    />
  );
}
