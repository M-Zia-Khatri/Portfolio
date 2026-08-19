import { Callout, Flex, TextArea, TextField } from "@radix-ui/themes";
import { TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { cn } from "@/shared/utils/cn";
import type { PortfolioFormValues } from "../portfolio.types";
import { PortfolioDialogActions } from "./PortfolioDialogActions";
import { PortfolioFormField } from "./PortfolioFormFields";
import { PortfolioImageField } from "./PortfolioImageField";
import { PortfolioLinksField } from "./PortfolioLinksField";
import { PortfolioTagsField } from "./PortfolioTagsField";

interface PortfolioFormProps {
  isEdit: boolean;
  submitting: boolean;
  apiError: string | null;
  errors: FieldErrors<PortfolioFormValues>;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  register: UseFormRegister<PortfolioFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onPickImage: () => void;
  imageRefCallback: (el: HTMLInputElement | null) => void;
  imageRegisterRest: Omit<
    ReturnType<UseFormRegister<PortfolioFormValues>>,
    "ref" | "name" | "onChange" | "onBlur"
  >;
}

export function PortfolioForm({
  isEdit,
  submitting,
  apiError,
  errors,
  previewUrl,
  fileInputRef,
  register,
  onSubmit,
  onPickImage,
  imageRefCallback,
  imageRegisterRest,
}: PortfolioFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Flex direction="column" gap="4" mt="4">
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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

        <PortfolioFormField label="Site Name *" error={errors.site_name?.message}>
          <TextField.Root
            placeholder="My Awesome Project"
            {...register("site_name")}
            className={cn(errors.site_name ? "border-(--red-7)" : "")}
          />
        </PortfolioFormField>

        <PortfolioFormField label="Role" error={errors.site_role?.message}>
          <TextField.Root placeholder="Full Stack Developer" {...register("site_role")} />
        </PortfolioFormField>

        <PortfolioLinksField error={errors.site_url?.message} register={register} />

        <PortfolioImageField
          isEdit={isEdit}
          error={(errors.site_image as { message?: string } | undefined)?.message}
          previewUrl={previewUrl}
          onPickImage={onPickImage}
          imageRefCallback={imageRefCallback}
          imageRegisterRest={imageRegisterRest}
          fileInputRef={fileInputRef}
        />

        <PortfolioTagsField error={errors.use_tech?.message} register={register} />

        <PortfolioFormField label="Description" error={errors.description?.message}>
          <TextArea
            placeholder="Brief description of the project..."
            rows={3}
            {...register("description")}
          />
        </PortfolioFormField>
      </Flex>

      <PortfolioDialogActions isEdit={isEdit} submitting={submitting} />
    </form>
  );
}
