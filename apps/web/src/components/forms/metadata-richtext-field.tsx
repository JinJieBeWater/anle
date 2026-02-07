import type { AnyFieldApi } from "@tanstack/react-form";

import { FormFieldLayout } from "@/components/forms/form-field-layout";
import { RichtextEditorDraftInput } from "@/components/editor/richtext-editor-draft-input";
import { RichtextEditorInput } from "@/components/editor/richtext-editor-input";
import type { MetadataRichtextField } from "@/components/forms/metadata-field-types";

type MetadataRichtextFieldProps = {
  field: MetadataRichtextField;
  metaField: AnyFieldApi;
  fieldId: string;
  isInvalid: boolean;
  objectId?: string;
  resetKey?: string;
};

export function MetadataRichtextField({
  field,
  metaField,
  fieldId,
  isInvalid,
  objectId,
  resetKey,
}: MetadataRichtextFieldProps) {
  const defaultValue = typeof metaField.state.value === "string" ? metaField.state.value : "";
  const isRequired = !field.optional;

  return (
    <FormFieldLayout
      label={field.key}
      htmlFor={fieldId}
      required={isRequired}
      isInvalid={isInvalid}
      errors={metaField.state.meta.errors}
    >
      {objectId ? (
        <RichtextEditorInput objectId={objectId} fieldKey={field.key} />
      ) : (
        <RichtextEditorDraftInput
          value={defaultValue}
          onChange={(value) => metaField.handleChange(value)}
          resetKey={resetKey}
        />
      )}
    </FormFieldLayout>
  );
}
