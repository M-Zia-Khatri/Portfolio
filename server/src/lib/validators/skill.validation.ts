import { z } from 'zod';

const terminalLineSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('command'), text: z.string().min(1) }),
  z.object({ kind: z.literal('output'), text: z.string().min(1) }),
  z.object({ kind: z.literal('comment'), text: z.string().min(1) }),
  z.object({ kind: z.literal('blank') }),
]);

const baseSkillSchema = {
  name: z.string().min(1).max(120),
  icon: z.string().min(1).max(120),
  fileName: z.string().min(1).max(255),
  lang: z.string().trim().min(1).max(120),
  color: z.string().min(1).max(32),
};

export const createSkillSchema = z.discriminatedUnion('mode', [
  z.object({
    ...baseSkillSchema,
    mode: z.literal('code'),
    code: z.array(z.string()).min(1),
    commands: z.null().optional(),
  }),
  z.object({
    ...baseSkillSchema,
    mode: z.literal('terminal'),
    commands: z.array(terminalLineSchema).min(1),
    code: z.null().optional(),
  }),
]);

export const updateSkillSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    icon: z.string().min(1).max(120).optional(),
    fileName: z.string().min(1).max(255).optional(),
    lang: z.string().trim().min(1).max(120).optional(),
    color: z.string().min(1).max(32).optional(),
    mode: z.enum(['code', 'terminal']).optional(),
    code: z.array(z.string()).min(1).nullable().optional(),
    commands: z.array(terminalLineSchema).min(1).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const resolvedMode = value.mode;

    if (resolvedMode === 'code' && value.commands !== undefined && value.commands !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['commands'],
        message: 'commands must be null when mode is code',
      });
    }

    if (resolvedMode === 'terminal' && value.code !== undefined && value.code !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['code'],
        message: 'code must be null when mode is terminal',
      });
    }
  });
