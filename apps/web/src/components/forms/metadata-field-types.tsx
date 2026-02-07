import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";

export type MetadataField = NonNullable<
  ObjectTemplateConfig["objects"][number]["metadata"]
>[number];

export type MetadataFieldType = MetadataField["type"];

export type MetadataFieldOf<T extends MetadataFieldType> = Extract<MetadataField, { type: T }>;

export type MetadataBooleanField = MetadataFieldOf<"boolean">;
export type MetadataEnumField = MetadataFieldOf<"enum">;
export type MetadataRichtextField = MetadataFieldOf<"richtext">;
export type MetadataStringField = MetadataFieldOf<"string">;
export type MetadataNumberField = MetadataFieldOf<"number">;
export type MetadataInputField = MetadataStringField | MetadataNumberField;
