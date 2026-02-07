import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";

type FormFieldLayoutProps = {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  isInvalid?: boolean;
  errors?: Array<{ message?: string } | undefined>;
  labelClassName?: string;
  contentClassName?: string;
  orientation?: React.ComponentProps<typeof Field>["orientation"];
  children: ReactNode;
};

export function FormFieldLayout({
  label,
  htmlFor,
  required = false,
  isInvalid = false,
  errors,
  labelClassName,
  contentClassName,
  orientation,
  children,
}: FormFieldLayoutProps) {
  const labelContent = typeof label === "string" ? <span>{label}</span> : label;

  return (
    <Field data-invalid={isInvalid} orientation={orientation}>
      <FieldLabel htmlFor={htmlFor} className={cn("flex items-center gap-1", labelClassName)}>
        {labelContent}
        {required ? (
          <>
            <span className="text-destructive text-sm font-normal" aria-hidden="true">
              *
            </span>
            <span className="sr-only">Required</span>
          </>
        ) : null}
      </FieldLabel>
      <FieldContent className={contentClassName}>
        {children}
        <FieldError errors={errors} />
      </FieldContent>
    </Field>
  );
}
