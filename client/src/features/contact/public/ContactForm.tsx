import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import type { AxiosError } from "axios";
import { memo, useRef } from "react";
import { useForm } from "react-hook-form";
import { analytics } from "@/shared/analytics";
import { HEADING, TEXT } from "@/shared/constants/style.constants";
import { ContactErrorState } from "./components/ContactErrorState";
import { ContactFields } from "./components/ContactFields";
import { ContactMessageField } from "./components/ContactMessageField";
import { ContactPromise, ContactSubmitButton } from "./components/ContactSubmitButton";
import { ContactSuccessState } from "./components/ContactSuccessState";
import { type ContactFormData, contactSchema } from "./contact.schema";
import { useContactForm } from "./hooks/useContactForm";

function FormCardHeader() {
  return (
    <div className="space-y-2">
      <Heading as="h3" size={HEADING.h3.size} weight="bold" className="text-white text-center">
        Contact Form
      </Heading>
      <Text size={TEXT.sm.size} weight="medium">
        Please contact me directly at{" "}
        <Text size={TEXT.sm.size} className="font-extrabold text-(--blue-a11)" as="span">
          muhammadziakhatri@gmail.com
        </Text>{" "}
        or drop your info here.
      </Text>
    </div>
  );
}

function ContactFormInner({
  onSubmit,
  isLoading,
  mutation,
}: ReturnType<typeof useContactForm> extends infer T
  ? T extends { onSubmit: infer S; isLoading: infer L; mutation: infer M }
    ? { onSubmit: S; isLoading: L; mutation: M }
    : never
  : never) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", message: "" },
  });
  const formStartedRef = useRef(false);

  const handleFormInteraction = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;

    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("analytics-contact-form-start") === "1") return;
      window.sessionStorage.setItem("analytics-contact-form-start", "1");
      analytics.track("contact_form_start", {});
    } catch {
      // analytics should fail silently
    }
  };

  const submitError = mutation.error as AxiosError<{ message?: string }> | null;
  const errorMessage =
    submitError?.response?.data?.message ?? "Something went wrong. Please try again.";

  return (
    <form
      className="animate-in fade-in duration-200"
      onSubmit={handleSubmit(onSubmit)}
      onFocusCapture={handleFormInteraction}
      onChangeCapture={handleFormInteraction}
      noValidate
    >
      <Flex direction="column" gap="4">
        <ContactFields register={register} errors={errors} isLoading={isLoading} />
        <ContactMessageField
          registration={register("message")}
          error={errors.message?.message}
          isLoading={isLoading}
        />
        {mutation.isError && <ContactErrorState message={errorMessage} />}
        <ContactPromise />
        <ContactSubmitButton isLoading={isLoading} />
      </Flex>
    </form>
  );
}

function ContactFormCard() {
  const { isLoading, mutation, onSubmit, resetForm, showSuccess } = useContactForm();

  return (
    <Card size="3">
      <FormCardHeader />
      <Separator my="4" size="4" />
      {showSuccess ? (
        <ContactSuccessState onReset={resetForm} />
      ) : (
        <ContactFormInner onSubmit={onSubmit} isLoading={isLoading} mutation={mutation} />
      )}
    </Card>
  );
}

export default memo(ContactFormCard);
