import { z } from "zod";

export const createPortfolioSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  site_role: z.string().optional(),
  site_url: z.string().url("Enter a valid URL"),
  site_image: z.custom<FileList>((v) => v instanceof FileList && v.length > 0, "Image is required"),
  use_tech: z.string().optional(),
  description: z.string().optional(),
});

export const editPortfolioSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  site_role: z.string().optional(),
  site_url: z.string().url("Enter a valid URL"),
  site_image: z.custom<FileList>().optional(),
  use_tech: z.string().optional(),
  description: z.string().optional(),
});
