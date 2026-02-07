import type { AnyFieldApi } from "@tanstack/react-form";

import { shouldNeverHappen } from "@/utils/should-never-happen";
import { MetadataBooleanField } from "@/components/forms/metadata-boolean-field";
import { MetadataEnumField } from "@/components/forms/metadata-enum-field";
import { MetadataInputField } from "@/components/forms/metadata-input-field";
import { MetadataRichtextField } from "@/components/forms/metadata-richtext-field";
import type {
  MetadataField,
  MetadataInputField as MetadataInputFieldType,
} from "@/components/forms/metadata-field-types";

type MetadataFieldRendererProps = {
  field: MetadataField;
  metaField: AnyFieldApi;
  fieldId: string;
  isInvalid: boolean;
  objectId?: string;
  resetKey?: string;
};

export function MetadataFieldRenderer(props: MetadataFieldRendererProps) {
  const { field, metaField, fieldId, isInvalid, objectId, resetKey } = props;
  switch (field.type) {
    case "boolean":
      return (
        <MetadataBooleanField
          field={field}
          metaField={metaField}
          fieldId={fieldId}
          isInvalid={isInvalid}
        />
      );
    case "enum":
      return (
        <MetadataEnumField
          field={field}
          metaField={metaField}
          fieldId={fieldId}
          isInvalid={isInvalid}
        />
      );
    case "richtext":
      return (
        <MetadataRichtextField
          field={field}
          metaField={metaField}
          fieldId={fieldId}
          isInvalid={isInvalid}
          objectId={objectId}
          resetKey={resetKey}
        />
      );
    case "string":
    case "number":
      return (
        <MetadataInputField
          field={field as MetadataInputFieldType}
          metaField={metaField}
          fieldId={fieldId}
          isInvalid={isInvalid}
        />
      );
    default:
      throw shouldNeverHappen("Unsupported metadata type", field);
  }
}
