import { z } from "zod";

// ─── TerminalLine sub-schemas ─────────────────────────────────────────────────
const commandLine = z.object({
  kind: z.literal("command"),
  text: z.string().min(1),
});
const outputLine = z.object({ kind: z.literal("output"), text: z.string() });
const commentLine = z.object({ kind: z.literal("comment"), text: z.string() });
const blankLine = z.object({ kind: z.literal("blank") });

const terminalLineSchema = z.discriminatedUnion("kind", [
  commandLine,
  outputLine,
  commentLine,
  blankLine,
]);

// ─── Create schemas (discriminated by mode) ───────────────────────────────────
const createCodeSkillSchema = z.object({
  name: z.string().min(1, "name is required"),
  icon: z.string().min(1, "icon is required"),
  fileName: z.string().min(1, "fileName is required"),
  lang: z.string().min(1, "lang is required"),
  color: z.string().min(1, "color is required"),
  mode: z.literal("code"),
  code: z.array(z.string()).min(1, "code array must have at least one line"),
  commands: z.undefined().or(z.null()).optional(),
});

const createTerminalSkillSchema = z.object({
  name: z.string().min(1, "name is required"),
  icon: z.string().min(1, "icon is required"),
  fileName: z.string().min(1, "fileName is required"),
  lang: z.string().min(1, "lang is required"),
  color: z.string().min(1, "color is required"),
  mode: z.literal("terminal"),
  commands: z.array(terminalLineSchema).min(1, "commands array must have at least one line"),
  code: z.undefined().or(z.null()).optional(),
});

export const createSkillSchema = z.discriminatedUnion("mode", [
  createCodeSkillSchema,
  createTerminalSkillSchema,
]);

// ─── Update schema (all fields optional, cross-field constraint via superRefine) ─
export const updateSkillSchema = z
  .object({
    name: z.string().min(1).optional(),
    icon: z.string().min(1).optional(),
    fileName: z.string().min(1).optional(),
    lang: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    mode: z.enum(["code", "terminal"]).optional(),
    code: z.array(z.string()).min(1).nullable().optional(),
    commands: z.array(terminalLineSchema).min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "code" && data.commands != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commands"],
        message: "commands must be null when mode is 'code'",
      });
    }
    if (data.mode === "terminal" && data.code != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["code"],
        message: "code must be null when mode is 'terminal'",
      });
    }
  });

// ─── Inferred types ───────────────────────────────────────────────────────────
export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
