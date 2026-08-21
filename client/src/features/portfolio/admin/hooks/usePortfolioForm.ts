import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { uploadToCloudinary } from "../portfolio.admin.api";
import { createPortfolioSchema, editPortfolioSchema } from "../portfolio.schema";
import type { PortfolioFormValues, PortfolioItem } from "../portfolio.types";

interface UsePortfolioFormOptions {
  editItem?: PortfolioItem | null;
  onSubmit: (data: Omit<PortfolioItem, "id">, id?: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function usePortfolioForm({ editItem, onSubmit, onOpenChange }: UsePortfolioFormOptions) {
  const isEdit = Boolean(editItem);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(
      isEdit ? editPortfolioSchema : createPortfolioSchema,
    ) as Resolver<PortfolioFormValues>,
    defaultValues: {
      site_name: "",
      site_role: "",
      site_url: "",
      use_tech: "",
      description: "",
    },
  });

  const { register, handleSubmit, reset, watch } = form;

  useEffect(() => {
    if (editItem) {
      reset({
        site_name: editItem.site_name,
        site_role: editItem.site_role,
        site_url: editItem.site_url,
        use_tech: editItem.use_tech.join(", "),
        description: editItem.description,
      });
      setPreviewUrl(editItem.site_image_url);
    } else {
      reset({
        site_name: "",
        site_role: "",
        site_url: "",
        use_tech: "",
        description: "",
      });
      setPreviewUrl(null);
    }
    setApiError(null);
  }, [editItem, reset]);

  const watchedImage = watch("site_image");
  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      const url = URL.createObjectURL(watchedImage[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedImage]);

  const onFormSubmit = async (values: PortfolioFormValues) => {
    setSubmitting(true);
    setApiError(null);

    try {
      let site_image_url = editItem?.site_image_url ?? "";

      if (values.site_image && values.site_image.length > 0) {
        site_image_url = await uploadToCloudinary(values.site_image[0]);
      }

      await onSubmit(
        {
          site_name: values.site_name,
          site_role: values.site_role ?? "",
          site_url: values.site_url,
          site_image_url,
          use_tech: (values.use_tech ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          description: values.description ?? "",
        },
        editItem?.id,
      );

      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unknown error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const { ref: imageRefCallback, ...imageRegisterRest } = register("site_image");

  return {
    isEdit,
    submitting,
    apiError,
    previewUrl,
    fileInputRef,
    register,
    handleSubmit,
    errors: form.formState.errors,
    onFormSubmit,
    imageRefCallback,
    imageRegisterRest,
    onPickImage: () => fileInputRef.current?.click(),
  };
}
