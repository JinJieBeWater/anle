import { z } from "zod";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";
import type { AnleSession } from "@/lib/powersync/types";
import { shouldNeverHappen } from "@/utils/should-never-happen";

type MetadataField = NonNullable<ObjectTemplateConfig["objects"][number]["metadata"]>[number];

const buildOptional = (schema: z.ZodTypeAny, isOptional: boolean): z.ZodTypeAny =>
  isOptional
    ? z.preprocess((value) => (value === "" ? undefined : value), schema.optional())
    : schema;

const createEnumSchema = (values: string[]): z.ZodTypeAny =>
  values.length === 0 ? z.string() : z.enum(values as [string, ...string[]]);

const parseNumberValue = (value: unknown): unknown => {
  if (value === "") {
    return undefined;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
};

const buildSchemaForField = (field: MetadataField): z.ZodTypeAny => {
  const isOptional = Boolean(field.optional);
  switch (field.type) {
    case "string":
    case "richtext":
      return buildOptional(z.string(), isOptional);
    case "number":
      return buildOptional(
        z.preprocess(parseNumberValue, z.number({ message: "Must be a number" })),
        isOptional,
      );
    case "boolean":
      return z.boolean();
    case "enum":
      return buildOptional(createEnumSchema(field.options.values), isOptional);
    default:
      throw shouldNeverHappen("Unsupported metadata type", field);
  }
};

export const buildMetadataDefaults = (fields: MetadataField[], session: AnleSession | null) =>
  Object.fromEntries(
    fields.map((field) => [field.key, resolveMetadataDefaultValue(field, session)]),
  ) as Record<string, unknown>;

export const buildMetadataPayload = (
  fields: MetadataField[],
  input: Record<string, unknown> | undefined,
) => {
  const normalizeArray = (value: unknown): unknown[] => {
    if (value === "" || value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  };

  return Object.fromEntries(
    fields.map((field) => {
      const raw = input?.[field.key];
      switch (field.type) {
        case "boolean":
          return [field.key, Boolean(raw)];
        case "number":
          return [field.key, raw === "" || raw === undefined ? null : Number(raw)];
        case "enum":
          if (field.collection === "array") {
            return [field.key, normalizeArray(raw)];
          }
          return [field.key, raw ?? ""];
        case "richtext":
          return [field.key, raw ?? ""];
        case "string":
          if (field.collection === "array") {
            return [field.key, normalizeArray(raw)];
          }
          return [field.key, raw ?? ""];
        default:
          throw shouldNeverHappen("Unsupported metadata type", field);
      }
    }),
  ) as Record<string, unknown>;
};

export function resolveMetadataDefaultValue(
  field: MetadataField,
  session: AnleSession | null,
): string | boolean {
  switch (field.type) {
    case "boolean":
      return field.default ?? false;
    case "number":
      return field.default !== undefined ? String(field.default) : "";
    case "enum":
      if (field.default !== undefined) {
        return field.default;
      }
      if (field.optional) {
        return "";
      }
      return field.options.values[0] ?? "";
    case "string":
      if (field.defaultRef === "user.username") {
        return session?.user?.name ?? session?.user?.email ?? "";
      }
      return field.default !== undefined ? String(field.default) : "";
    case "richtext":
      return field.default !== undefined ? String(field.default) : "";
    default:
      throw shouldNeverHappen("Unsupported metadata type", field);
  }
}

export function buildMetadataSchema(
  fields: MetadataField[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape = fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
    acc[field.key] = buildSchemaForField(field);
    return acc;
  }, {});

  return z.object(shape);
}
