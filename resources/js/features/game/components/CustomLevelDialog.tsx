import {
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Callout,
  Dialog,
  Flex,
  IconButton,
  Separator,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useState } from 'react';
import { generateId } from '../services/idGenerator';
import useGameSet, { type CustomLevelPreset } from '../store/GameSetStore';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FORM = {
  name: '',
  maxNumber: '',
  guessLimit: '',
  timeMinutes: '',
  timeSeconds: '',
};

type FormState = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!f.name.trim()) errors.name = 'Name is required';
  const max = Number(f.maxNumber);
  if (!f.maxNumber) errors.maxNumber = 'Required';
  else if (isNaN(max) || max < 2 || max > 100) errors.maxNumber = 'Must be 2–100';
  const limit = Number(f.guessLimit);
  if (!f.guessLimit) errors.guessLimit = 'Required';
  else if (isNaN(limit) || limit < 1 || limit > 50) errors.guessLimit = 'Must be 1–50';
  const mins = Number(f.timeMinutes);
  if (f.timeMinutes === '') errors.timeMinutes = 'Required';
  else if (isNaN(mins) || mins < 0 || mins > 59) errors.timeMinutes = '0–59';
  const secs = Number(f.timeSeconds);
  if (f.timeSeconds === '') errors.timeSeconds = 'Required';
  else if (isNaN(secs) || secs < 0 || secs > 59) errors.timeSeconds = '0–59';
  if (!errors.timeMinutes && !errors.timeSeconds && mins === 0 && secs === 0)
    errors.timeMinutes = 'Total time must be > 0';
  return errors;
}

function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="column" gap="1" style={{ flex: 1 }}>
      <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
        {label}
      </Text>
      {children}
      {error && (
        <Text size="1" style={{ color: 'var(--red-11)' }}>
          {error}
        </Text>
      )}
    </Flex>
  );
}

export default function CustomLevelDialog({ open, onOpenChange }: Props) {
  const { customLevels, addCustomLevel, updateCustomLevel, removeCustomLevel } = useGameSet();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  // null = adding new, string id = editing existing
  const [editingId, setEditingId] = useState<string | null>(null);

  const setField = (key: keyof FormState, val: string) => {
    const next = { ...form, [key]: val };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const handleEdit = (lvl: CustomLevelPreset) => {
    const m = Math.floor(lvl.totalSeconds / 60);
    const s = lvl.totalSeconds % 60;
    setForm({
      name: lvl.name,
      maxNumber: String(lvl.maxNumber),
      guessLimit: String(lvl.guessLimit),
      timeMinutes: String(m),
      timeSeconds: String(s),
    });
    setErrors({});
    setSubmitted(false);
    setEditingId(lvl.id);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setEditingId(null);
  };

  const handleSave = () => {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: CustomLevelPreset = {
      id: editingId ?? generateId(8),
      name: form.name.trim(),
      maxNumber: Number(form.maxNumber),
      guessLimit: Number(form.guessLimit),
      totalSeconds: Number(form.timeMinutes) * 60 + Number(form.timeSeconds),
    };

    if (editingId) updateCustomLevel(editingId, payload);
    else addCustomLevel(payload);

    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setEditingId(null);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    setEditingId(null);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content
        maxWidth="480px"
        style={{
          background: 'var(--gray-2)',
          border: '1px solid var(--gray-5)',
        }}
      >
        <Dialog.Title style={{ color: 'var(--gray-12)' }}>Custom Difficulty Levels</Dialog.Title>
        <Dialog.Description size="2" style={{ color: 'var(--gray-10)' }}>
          Create your own difficulty presets. They'll appear in the level selector.
        </Dialog.Description>

        {/* ── Saved levels list ── */}
        {customLevels.length > 0 && (
          <Flex direction="column" gap="2" mt="4">
            <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
              Saved levels
            </Text>
            <Flex direction="column" gap="2">
              {customLevels.map((lvl) => {
                const m = Math.floor(lvl.totalSeconds / 60);
                const s = lvl.totalSeconds % 60;
                const isBeingEdited = editingId === lvl.id;
                return (
                  <Flex
                    key={lvl.id}
                    align="center"
                    justify="between"
                    px="3"
                    py="2"
                    style={{
                      background: isBeingEdited ? 'var(--blue-a3)' : 'var(--gray-3)',
                      border: `1px solid ${isBeingEdited ? 'var(--blue-7)' : 'var(--gray-5)'}`,
                      borderRadius: 8,
                      transition: 'background 0.2s, border-color 0.2s',
                    }}
                  >
                    <Flex align="center" gap="2" wrap="wrap">
                      <Text
                        size="2"
                        weight="bold"
                        style={{
                          color: isBeingEdited ? 'var(--blue-11)' : 'var(--gray-12)',
                        }}
                      >
                        {lvl.name}
                      </Text>
                      <Badge color="gray" variant="soft" size="1">
                        1–{lvl.maxNumber}
                      </Badge>
                      <Badge color="blue" variant="soft" size="1">
                        {lvl.guessLimit} guesses
                      </Badge>
                      <Badge color="amber" variant="soft" size="1">
                        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
                      </Badge>
                    </Flex>

                    <Flex gap="1" align="center">
                      {isBeingEdited ? (
                        /* Cancel edit */
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="gray"
                          onClick={handleCancelEdit}
                          title="Cancel edit"
                        >
                          <Cross2Icon />
                        </IconButton>
                      ) : (
                        /* Edit */
                        <IconButton
                          size="1"
                          variant="ghost"
                          color="blue"
                          onClick={() => handleEdit(lvl)}
                          title="Edit level"
                        >
                          <Pencil1Icon />
                        </IconButton>
                      )}
                      {/* Delete */}
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => {
                          if (isBeingEdited) handleCancelEdit();
                          removeCustomLevel(lvl.id);
                        }}
                        title="Delete level"
                      >
                        <TrashIcon />
                      </IconButton>
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        )}

        <Separator size="4" my="4" style={{ background: 'var(--gray-5)' }} />

        {/* ── Add / Edit form ── */}
        <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
          {editingId ? '✏️ Edit level' : 'Add new level'}
        </Text>

        <Flex direction="column" gap="3" mt="2">
          <FieldRow label="Level name" error={errors.name}>
            <TextField.Root
              placeholder="e.g. Insane"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              color={errors.name ? 'red' : 'blue'}
            />
          </FieldRow>

          <Flex gap="3">
            <FieldRow label="Max number (2–100)" error={errors.maxNumber}>
              <TextField.Root
                type="number"
                placeholder="50"
                min={2}
                max={100}
                value={form.maxNumber}
                onChange={(e) => setField('maxNumber', e.target.value)}
                color={errors.maxNumber ? 'red' : 'blue'}
              />
            </FieldRow>
            <FieldRow label="Guess limit (1–50)" error={errors.guessLimit}>
              <TextField.Root
                type="number"
                placeholder="5"
                min={1}
                max={50}
                value={form.guessLimit}
                onChange={(e) => setField('guessLimit', e.target.value)}
                color={errors.guessLimit ? 'red' : 'blue'}
              />
            </FieldRow>
          </Flex>

          <Flex gap="3">
            <FieldRow label="Minutes (0–59)" error={errors.timeMinutes}>
              <TextField.Root
                type="number"
                placeholder="2"
                min={0}
                max={59}
                value={form.timeMinutes}
                onChange={(e) => setField('timeMinutes', e.target.value)}
                color={errors.timeMinutes ? 'red' : 'blue'}
              />
            </FieldRow>
            <FieldRow label="Seconds (0–59)" error={errors.timeSeconds}>
              <TextField.Root
                type="number"
                placeholder="30"
                min={0}
                max={59}
                value={form.timeSeconds}
                onChange={(e) => setField('timeSeconds', e.target.value)}
                color={errors.timeSeconds ? 'red' : 'blue'}
              />
            </FieldRow>
          </Flex>

          {errors.timeMinutes === 'Total time must be > 0' && (
            <Callout.Root color="red" variant="soft" size="1">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>Total time must be greater than 0 seconds.</Callout.Text>
            </Callout.Root>
          )}
        </Flex>

        {/* ── Footer ── */}
        <Flex gap="3" justify="between" mt="5">
          {editingId ? (
            <Button variant="soft" color="gray" onClick={handleCancelEdit}>
              <Cross2Icon />
              Cancel Edit
            </Button>
          ) : (
            <span />
          )}

          <Flex gap="2">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={handleClose}>
                Close
              </Button>
            </Dialog.Close>
            <Button variant="solid" color={editingId ? 'amber' : 'blue'} onClick={handleSave}>
              {editingId ? <CheckIcon /> : <PlusIcon />}
              {editingId ? 'Save Changes' : 'Add Level'}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
