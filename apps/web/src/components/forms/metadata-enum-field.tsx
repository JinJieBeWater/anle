import type { AnyFieldApi } from "@tanstack/react-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldLayout } from "@/components/forms/form-field-layout";
import type { MetadataEnumField } from "@/components/forms/metadata-field-types";

type MetadataEnumFieldProps = {
  field: MetadataEnumField;
  metaField: AnyFieldApi;
  fieldId: string;
  isInvalid: boolean;
};

export function MetadataEnumField({
  field,
  metaField,
  fieldId,
  isInvalid,
}: MetadataEnumFieldProps) {
  const isRequired = !field.optional;

  return (
    <FormFieldLayout
      label={field.key}
      htmlFor={fieldId}
      required={isRequired}
      isInvalid={isInvalid}
      errors={metaField.state.meta.errors}
    >
      <Select
        value={String(metaField.state.value ?? "")}
        onValueChange={(value) => metaField.handleChange(value ?? "")}
      >
        <SelectTrigger id={fieldId} className="w-full max-w-48" aria-invalid={isInvalid}>
          <SelectValue placeholder={field.optional ? "(empty)" : "Select"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {field.optional ? <SelectItem value="">(empty)</SelectItem> : null}
            {field.options.values.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormFieldLayout>
  );
}
