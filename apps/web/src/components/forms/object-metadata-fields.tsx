import type { ComponentType, ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { MetadataFieldRenderer } from "@/components/forms/metadata-field-renderer";
import type { MetadataField } from "@/components/forms/metadata-field-types";
import type { RelationSelection } from "@/lib/object-template";

export type CreateObjectFormValues = {
  name: string;
  metadata: Record<string, unknown>;
  relations: RelationSelection[];
};

export type CreateObjectFormApi = {
  Field: ComponentType<{
    name: string;
    children: (field: AnyFieldApi) => ReactNode;
  }>;
};

type ObjectMetadataFieldRowProps = {
  field: MetadataField;
  form: CreateObjectFormApi;
  objectId?: string;
  resetKey?: string;
};

function ObjectMetadataFieldRow({ field, form, objectId, resetKey }: ObjectMetadataFieldRowProps) {
  return (
    <form.Field name={`metadata.${field.key}`}>
      {(metaField: AnyFieldApi) => {
        const fieldId = `meta-${field.key}`;
        const isInvalid = metaField.state.meta.isTouched && !metaField.state.meta.isValid;

        return (
          <MetadataFieldRenderer
            field={field}
            metaField={metaField}
            fieldId={fieldId}
            isInvalid={isInvalid}
            objectId={objectId}
            resetKey={resetKey}
          />
        );
      }}
    </form.Field>
  );
}

type ObjectMetadataFieldsProps = {
  fields: MetadataField[];
  form: CreateObjectFormApi;
  objectId?: string;
  resetKey?: string;
};

export function ObjectMetadataFields({
  fields,
  form,
  objectId,
  resetKey,
}: ObjectMetadataFieldsProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <>
      {fields.map((field) => (
        <ObjectMetadataFieldRow
          key={field.key}
          field={field}
          form={form}
          objectId={objectId}
          resetKey={resetKey}
        />
      ))}
    </>
  );
}
