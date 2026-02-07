import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import z from "zod";

const objectTemplatePageSchema = z.enum(["home", "default"]);

const objectTemplateRelationTypeSchema = z.enum(["member", "parent", "next", "prev", "reference"]);

const objectTemplateEnumOptionsSchema = z.object({
  values: z.array(z.string()),
});

const objectTemplateDefaultRefSchema = z.enum(["user.username"]);

const objectTemplateCollectionSchema = z.enum(["array"]);

const objectTemplateMetadataBaseSchema = z.object({
  key: z.string(),
  optional: z.boolean().optional(),
  hideOnCreate: z.boolean().optional(),
});

const objectTemplateMetadataStringSchema = objectTemplateMetadataBaseSchema
  .extend({
    type: z.literal("string"),
    collection: objectTemplateCollectionSchema.optional(),
    default: z.string().optional(),
    defaultRef: objectTemplateDefaultRefSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.default !== undefined && value.defaultRef !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "default and defaultRef cannot be used together",
      });
    }
  });

const objectTemplateMetadataNumberSchema = objectTemplateMetadataBaseSchema.extend({
  type: z.literal("number"),
  default: z.number().optional(),
});

const objectTemplateMetadataBooleanSchema = objectTemplateMetadataBaseSchema.extend({
  type: z.literal("boolean"),
  default: z.boolean().optional(),
});

const objectTemplateMetadataRichtextSchema = objectTemplateMetadataBaseSchema.extend({
  type: z.literal("richtext"),
  default: z.string().optional(),
});

const objectTemplateMetadataEnumSchema = objectTemplateMetadataBaseSchema
  .extend({
    type: z.literal("enum"),
    collection: objectTemplateCollectionSchema.optional(),
    default: z.string().optional(),
    options: objectTemplateEnumOptionsSchema,
  })
  .superRefine((value, ctx) => {
    if (value.default !== undefined && !value.options.values.includes(value.default)) {
      ctx.addIssue({
        code: "custom",
        message: "enum default must be one of options.values",
      });
    }
  });

export const objectTemplateMetadataSchema = z
  .union([
    objectTemplateMetadataStringSchema,
    objectTemplateMetadataNumberSchema,
    objectTemplateMetadataBooleanSchema,
    objectTemplateMetadataRichtextSchema,
    objectTemplateMetadataEnumSchema,
  ])
  .superRefine((value, ctx) => {
    if (!value.hideOnCreate || value.optional) {
      return;
    }

    const hasDefault =
      ("default" in value && value.default !== undefined) ||
      ("defaultRef" in value && value.defaultRef !== undefined);

    if (!hasDefault) {
      ctx.addIssue({
        code: "custom",
        message: "hideOnCreate requires a default value for required fields",
      });
    }
  });

export const objectTemplateRelationSchema = z.object({
  type: objectTemplateRelationTypeSchema,
  targetType: z.string(),
});

export const objectTemplateObjectSchema = z.object({
  type: z.string(),
  label: z.string().optional(),
  page: objectTemplatePageSchema.optional(),
  metadata: z.array(objectTemplateMetadataSchema).optional(),
  relations: z.array(objectTemplateRelationSchema).optional(),
});

export const objectTemplateConfigSchema = z
  .object({
    objects: z.array(objectTemplateObjectSchema),
  })
  .superRefine((value, ctx) => {
    const typeSet = new Set(value.objects.map((obj) => obj.type));
    value.objects.forEach((obj, objectIndex) => {
      obj.relations?.forEach((relation, relationIndex) => {
        if (!typeSet.has(relation.targetType)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `relation.targetType contains unknown type: ${relation.targetType}`,
            path: ["objects", objectIndex, "relations", relationIndex, "targetType"],
          });
        }
      });
    });
  });

export type ObjectTemplateConfig = z.infer<typeof objectTemplateConfigSchema>;

export const objectTemplate = pgTable(
  "object_template",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    owner_id: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    config: jsonb("config").$type<ObjectTemplateConfig>(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("object_template_owner_idx").on(table.owner_id),
    pgPolicy("object_template_owner", {
      for: "all",
      to: "public",
      using: sql`${table.owner_id} = current_setting('app.user_id', true)`,
      withCheck: sql`${table.owner_id} = current_setting('app.user_id', true)`,
    }),
  ],
).enableRLS();

export const objectTemplateRelations = relations(objectTemplate, ({ one }) => ({
  owner: one(user, {
    fields: [objectTemplate.owner_id],
    references: [user.id],
  }),
}));
