import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useOptimistic, useRef, useTransition } from "react";
import { submitContactForm } from "@/features/contact/api";
import { useSectionActive } from "@/features/home/hooks/useSectionActive";
import { analytics } from "@/shared/analytics";
import type { Contact } from "../../types";
import type { ContactFormData } from "../contact.schema";

export function useContactForm() {
  const [isPendingTransition, startTransition] = useTransition();
  const isContactOpen = useSectionActive("contact");
  const contactOpenedRef = useRef(false);
  const successTrackedRef = useRef(false);

  const mutation = useMutation<Contact, AxiosError, ContactFormData, unknown>({
    mutationFn: submitContactForm,
  });

  useEffect(() => {
    if (!isContactOpen || contactOpenedRef.current) return;
    contactOpenedRef.current = true;

    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem("analytics-contact-open") === "1") return;
      window.sessionStorage.setItem("analytics-contact-open", "1");
      analytics.track("contact_open", {});
    } catch {
      // analytics should fail silently
    }
  }, [isContactOpen]);

  const [optimisticSuccess, setOptimisticSuccess] = useOptimistic(
    false,
    (_, newState: boolean) => newState,
  );

  const onSubmit = (data: ContactFormData) => {
    analytics.track("contact_submit", {});

    startTransition(async () => {
      try {
        setOptimisticSuccess(true);
        await mutation.mutateAsync(data);
      } catch {
        // Handled by mutation error state
      }
    });
  };

  useEffect(() => {
    if (!mutation.isSuccess || successTrackedRef.current) return;
    successTrackedRef.current = true;
    analytics.track("contact_success", {});
  }, [mutation.isSuccess]);

  return {
    isLoading: mutation.isPending || isPendingTransition,
    mutation,
    onSubmit,
    resetForm: mutation.reset,
    showSuccess: (optimisticSuccess && !mutation.isError) || mutation.isSuccess,
  };
}
