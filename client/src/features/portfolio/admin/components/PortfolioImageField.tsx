import { Text } from "@radix-ui/themes";
import { ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { RefObject } from "react";
import { cn } from "@/shared/utils/cn";
import { PortfolioFormField } from "./PortfolioFormFields";

interface PortfolioImageFieldProps {
  isEdit: boolean;
  error?: string;
  previewUrl: string | null;
  onPickImage: () => void;
  imageRefCallback: (el: HTMLInputElement | null) => void;
  imageRegisterRest: Record<string, unknown>;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function PortfolioImageField({
  isEdit,
  error,
  previewUrl,
  onPickImage,
  imageRefCallback,
  imageRegisterRest,
  fileInputRef,
}: PortfolioImageFieldProps) {
  return (
    <PortfolioFormField
      label={isEdit ? "Image (leave blank to keep current)" : "Image *"}
      error={error}
    >
      <button
        type="button"
        className={cn(
          "relative flex flex-col items-center justify-center gap-2",
          "border-2 border-dashed rounded-(--radius-3) p-4",
          "border-(--gray-6) hover:border-(--blue-7)",
          "transition-colors duration-150 overflow-hidden",
        )}
        onClick={onPickImage}
        aria-label={isEdit ? "Upload image" : "Upload image (required)"}
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
              className={cn("w-full max-h-32 object-cover rounded-(--radius-2)")}
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn("flex flex-col items-center gap-2")}
            >
              <ImageIcon size={24} className={cn("text-(--gray-8)")} />
              <Text size="1" className={cn("text-(--gray-9)")}>
                Click to upload image
              </Text>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          accept="image/*"
          className={cn("hidden")}
          {...imageRegisterRest}
          ref={(el) => {
            imageRefCallback(el);
            fileInputRef.current = el;
          }}
        />
      </button>
    </PortfolioFormField>
  );
}
