import { Dialog } from "@radix-ui/themes";
import { cn } from "@/shared/utils/cn";
import type { PortfolioItem } from "./portfolio.types";
import { PortfolioForm } from "./components/PortfolioForm";
import { usePortfolioForm } from "./hooks/usePortfolioForm";

interface PortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: PortfolioItem | null;
  onSubmit: (data: Omit<PortfolioItem, "id">, id?: string) => Promise<void>;
}

export function PortfolioDialog({ open, onOpenChange, editItem, onSubmit }: PortfolioDialogProps) {
  const form = usePortfolioForm({ editItem, onSubmit, onOpenChange });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px" className={cn("bg-(--gray-2) border border-(--gray-4)")}>
        <Dialog.Title className={cn("text-(--gray-12)")}>
          {form.isEdit ? "Edit Portfolio Item" : "Add Portfolio Item"}
        </Dialog.Title>
        <Dialog.Description size="2" className={cn("text-(--gray-10)")}>
          {form.isEdit
            ? "Update the details for this portfolio entry."
            : "Fill in the details to add a new portfolio entry."}
        </Dialog.Description>

        <PortfolioForm
          isEdit={form.isEdit}
          submitting={form.submitting}
          apiError={form.apiError}
          errors={form.errors}
          previewUrl={form.previewUrl}
          fileInputRef={form.fileInputRef}
          register={form.register}
          onSubmit={form.handleSubmit(form.onFormSubmit)}
          onPickImage={form.onPickImage}
          imageRefCallback={form.imageRefCallback}
          imageRegisterRest={form.imageRegisterRest}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
