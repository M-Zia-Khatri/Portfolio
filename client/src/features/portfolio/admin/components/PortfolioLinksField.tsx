import { TextField } from "@radix-ui/themes";
import { cn } from "@/shared/utils/cn";
import type { PortfolioFormValues } from "../portfolio.types";
import { PortfolioFormField } from "./PortfolioFormFields";
import type { UseFormRegister } from "react-hook-form";

interface PortfolioLinksFieldProps {
  error?: string;
  register: UseFormRegister<PortfolioFormValues>;
}

export function PortfolioLinksField({ error, register }: PortfolioLinksFieldProps) {
  return (
    <PortfolioFormField label="Site URL *" error={error}>
      <TextField.Root
        placeholder="https://example.com"
        type="url"
        {...register("site_url")}
        className={cn(error ? "border-(--red-7)" : "")}
      />
    </PortfolioFormField>
  );
}
