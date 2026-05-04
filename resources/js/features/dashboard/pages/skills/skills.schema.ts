import { z } from 'zod';

const terminalLineSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('command'), text: z.string().min(1, 'Command required') }),
  z.object({ kind: z.literal('output'), text: z.string().min(1, 'Output required') }),
  z.object({ kind: z.literal('comment'), text: z.string().min(1, 'Comment required') }),
  z.object({ kind: z.literal('blank') }),
]);

export const skillSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  fileName: z.string().min(1, 'File name is required'),
  lang: z.string().min(1, 'Language is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  mode: z.enum(['code', 'terminal']),
  icon: z.string().min(1, 'Icon selection is required'),
  // Used for 'code' mode
  content: z.string().optional(),
  // Used for 'terminal' mode
  commands: z.array(terminalLineSchema).optional(),
});

export type SkillFormValues = z.infer<typeof skillSchema>;
