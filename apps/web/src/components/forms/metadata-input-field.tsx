import type { AnyFieldApi } from "@tanstack/react-form";

import { Input } from "@/components/ui/input";
import { FormFieldLayout } from "@/components/forms/form-field-layout";
import type { MetadataInputField } from "@/components/forms/metadata-field-types";

type MetadataInputFieldProps = {
  field: MetadataInputField;
  metaField: AnyFieldApi;
  fieldId: string;
  isInvalid: boolean;
};

export function MetadataInputField({
  field,
  metaField,
  fieldId,
  isInvalid,
}: MetadataInputFieldProps) {
  const isRequired = !field.optional;

  return (
    <FormFieldLayout
      label={field.key}
      htmlFor={fieldId}
      required={isRequired}
      isInvalid={isInvalid}
      errors={metaField.state.meta.errors}
    >
      <Input
        id={fieldId}
        type={field.type === "number" ? "number" : "text"}
        value={String(metaField.state.value ?? "")}
        onBlur={metaField.handleBlur}
        onChange={(event) => metaField.handleChange(event.target.value)}
        aria-invalid={isInvalid}
      />
    </FormFieldLayout>
  );
}
