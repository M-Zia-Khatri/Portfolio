import { Dialog } from "@radix-ui/themes";
import { useState } from "react";
import { generateId } from "../services/idGenerator";
import useGameSet from "../store/GameSetStore";
import { customLevelFormFromPreset, customLevelPayloadFromForm } from "../utils/customLevel.utils";
import {
  EMPTY_CUSTOM_LEVEL_FORM,
  type CustomLevelFormErrors,
  type CustomLevelFormState,
  validateCustomLevelForm,
} from "../validation/customLevel.validation";
import { CustomLevelActions } from "./CustomLevelActions";
import { CustomLevelForm } from "./CustomLevelForm";
import { CustomLevelPreview } from "./CustomLevelPreview";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomLevelDialog({ open, onOpenChange }: Props) {
  const { customLevels, addCustomLevel, updateCustomLevel, removeCustomLevel } = useGameSet();
  const [form, setForm] = useState<CustomLevelFormState>(EMPTY_CUSTOM_LEVEL_FORM);
  const [errors, setErrors] = useState<CustomLevelFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = (key: keyof CustomLevelFormState, val: string) => {
    const next = { ...form, [key]: val };
    setForm(next);
    if (submitted) setErrors(validateCustomLevelForm(next));
  };

  const handleEdit = (lvl: Parameters<typeof customLevelFormFromPreset>[0]) => {
    setForm(customLevelFormFromPreset(lvl));
    setErrors({});
    setSubmitted(false);
    setEditingId(lvl.id);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_CUSTOM_LEVEL_FORM);
    setErrors({});
    setSubmitted(false);
    setEditingId(null);
  };

  const handleSave = () => {
    setSubmitted(true);
    const errs = validateCustomLevelForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = customLevelPayloadFromForm(form, editingId, generateId);
    if (editingId) updateCustomLevel(editingId, payload);
    else addCustomLevel(payload);

    handleCancelEdit();
  };

  const handleClose = () => {
    handleCancelEdit();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content maxWidth="480px" style={{ background: "var(--gray-2)", border: "1px solid var(--gray-5)" }}>
        <Dialog.Title style={{ color: "var(--gray-12)" }}>Custom Difficulty Levels</Dialog.Title>
        <Dialog.Description size="2" style={{ color: "var(--gray-10)" }}>
          Create your own difficulty presets. They'll appear in the level selector.
        </Dialog.Description>

        <CustomLevelPreview
          customLevels={customLevels}
          editingId={editingId}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={(id, isBeingEdited) => {
            if (isBeingEdited) handleCancelEdit();
            removeCustomLevel(id);
          }}
        />

        <CustomLevelForm editingId={editingId} form={form} errors={errors} onFieldChange={setField} />

        <CustomLevelActions
          editingId={editingId}
          onCancelEdit={handleCancelEdit}
          onClose={handleClose}
          onSave={handleSave}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
}
