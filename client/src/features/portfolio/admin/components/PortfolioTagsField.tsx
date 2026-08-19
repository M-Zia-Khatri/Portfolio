import { TextField } from "@radix-ui/themes";
import type { UseFormRegister } from "react-hook-form";
import type { PortfolioFormValues } from "../portfolio.types";
import { PortfolioFormField } from "./PortfolioFormFields";

interface PortfolioTagsFieldProps {
  error?: string;
  register: UseFormRegister<PortfolioFormValues>;
}

export function PortfolioTagsField({ error, register }: PortfolioTagsFieldProps) {
  return (
    <PortfolioFormField label="Technologies (comma-separated)" error={error}>
      <TextField.Root placeholder="React, Node.js, PostgreSQL" {...register("use_tech")} />
    </PortfolioFormField>
  );
}
