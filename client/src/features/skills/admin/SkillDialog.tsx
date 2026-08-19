import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/themes";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ICON_OPTIONS } from "./iconMap";
import { SkillDialogActions, SkillFormFields } from "./components/SkillFormFields";
import { type SkillFormValues, skillSchema } from "./skills.schema";

interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkillFormValues) => void;
  initialData?: any;
  isPending: boolean;
}

export default function SkillDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isPending,
}: SkillDialogProps) {
  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: { mode: "code", commands: [] },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        icon: initialData.icon ?? ICON_OPTIONS[0],
        content: initialData.mode === "code" ? initialData.code.join("\n") : "",
        commands: initialData.mode === "terminal" ? initialData.commands : [],
      });
    } else {
      reset({
        mode: "code",
        color: "#61dafb",
        icon: ICON_OPTIONS[0],
        commands: [],
        content: "",
      });
    }
  }, [initialData, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
        <Dialog.Title>{initialData ? "Edit Skill" : "Add New Skill"}</Dialog.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SkillFormFields form={form} />
          <SkillDialogActions isPending={isPending} />
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
