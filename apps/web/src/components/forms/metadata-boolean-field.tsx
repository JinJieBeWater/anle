import type { AnyFieldApi } from "@tanstack/react-form";

import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldLayout } from "@/components/forms/form-field-layout";
import type { MetadataBooleanField } from "@/components/forms/metadata-field-types";

type MetadataBooleanFieldProps = {
  field: MetadataBooleanField;
  metaField: AnyFieldApi;
  fieldId: string;
  isInvalid: boolean;
};

export function MetadataBooleanField({
  field,
  metaField,
  fieldId,
  isInvalid,
}: MetadataBooleanFieldProps) {
  const isRequired = !field.optional;

  return (
    <FormFieldLayout
      label={field.key}
      htmlFor={fieldId}
      required={isRequired}
      isInvalid={isInvalid}
      errors={metaField.state.meta.errors}
      orientation="horizontal"
    >
      <Checkbox
        id={fieldId}
        checked={Boolean(metaField.state.value)}
        aria-invalid={isInvalid}
        onCheckedChange={(checked) => {
          metaField.handleChange(Boolean(checked));
        }}
      />
    </FormFieldLayout>
  );
}
