import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { user } from "./auth";
import z from "zod";

export const objectTemplateFieldSchema = z.object({
  key: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
  options: z.unknown().optional(),
});

export const objectTemplateChildrenCapabilitySchema = z.object({
  allowedTypes: z.array(z.string()).optional(),
});

export const objectTemplateCapabilitiesSchema = z.object({
  children: objectTemplateChildrenCapabilitySchema.optional(),
});

export const objectTemplateObjectSchema = z.object({
  type: z.string(),
  label: z.string().optional(),
  metadataFields: z.array(objectTemplateFieldSchema).optional(),
  capabilities: objectTemplateCapabilitiesSchema.optional(),
});

export const objectTemplateConfigSchema = z.object({
  objects: z.array(objectTemplateObjectSchema),
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
  (table) => [index("object_template_owner_idx").on(table.owner_id)],
);

export const objectTemplateRelations = relations(objectTemplate, ({ one }) => ({
  owner: one(user, {
    fields: [objectTemplate.owner_id],
    references: [user.id],
  }),
}));
