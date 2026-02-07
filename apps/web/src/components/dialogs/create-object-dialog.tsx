import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FieldGroup } from "@/components/ui/field";
import { FormFieldLayout } from "@/components/forms/form-field-layout";
import { Input } from "@/components/ui/input";
import { objectCollection } from "@/lib/collections";
import type { ObjectTemplate } from "@/lib/powersync/schema";
import {
  objectTemplateRelationSchema,
  type ObjectTemplateConfig,
} from "@anle/db/schema/object-template";
import { useAppSession } from "@/hooks/use-app-session";
import { objectSchema } from "@anle/api/routers/object/schema";
import { db } from "@/lib/powersync/db";
import {
  buildMetadataDefaults,
  buildMetadataPayload,
  buildMetadataSchema,
} from "@/lib/object-metadata";
import {
  ObjectMetadataFields,
  type CreateObjectFormValues,
} from "@/components/forms/object-metadata-fields";
import {
  buildRelationEntries,
  buildRelationFields,
  ObjectRelationFields,
  type RelationContext,
  type RelationEntry,
} from "@/components/forms/object-relation-fields";
import { buildTemplateGraph, getTemplateObjectLabel } from "@/lib/object-template";
import {
  buildRichtextDrafts,
  type RichtextDraft,
} from "@/components/editor/richtext-editor-draft-input";

const createObjectDialog = AlertDialogPrimitive.createHandle();

const persistRelationAndUpdates = async ({
  objectId,
  relationEntries,
  richtextDrafts,
}: {
  objectId: string;
  relationEntries: Map<string, RelationEntry>;
  richtextDrafts: RichtextDraft[];
}) => {
  const createdAt = new Date().toISOString();
  await db.writeTransaction(async (tx) => {
    for (const entry of relationEntries.values()) {
      await tx.execute(
        /* sql */ `
          INSERT INTO
            object_relation (id, from_object_id, to_object_id, type, position, created_at)
          VALUES
            (?, ?, ?, ?, ?, ?)
        `,
        [crypto.randomUUID(), entry.fromObjectId, objectId, entry.relationType, null, createdAt],
      );
    }
    for (const entry of richtextDrafts) {
      await tx.execute(
        /* sql */ `
          INSERT INTO
            object_update (id, object_id, field_key, created_at, update_data)
          VALUES
            (?, ?, ?, ?, ?)
        `,
        [crypto.randomUUID(), objectId, entry.fieldKey, createdAt, entry.updateData],
      );
    }
  });
};

type CreateObjectDialogProps = {
  template: ObjectTemplate;
  templateObject: ObjectTemplateConfig["objects"][number];
  ownerId: string;
  relation?: RelationContext;
};

export function CreateObjectDialog({
  template,
  templateObject,
  ownerId,
  relation,
}: CreateObjectDialogProps) {
  const primaryType = templateObject.type;
  const { session } = useAppSession();
  const metadataFields = templateObject.metadata ?? [];
  const visibleMetadataFields = metadataFields.filter((field) => !field.hideOnCreate);
  const templateLabel = getTemplateObjectLabel(templateObject);
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());

  const initialMetadataValues = useMemo(
    () => buildMetadataDefaults(metadataFields, session),
    [metadataFields, session],
  );
  const templateGraph = useMemo(() => buildTemplateGraph(template), [template]);

  const { data: templateObjectsById } = useLiveQuery(
    (q) =>
      q
        .from({ object: objectCollection })
        .where(({ object }) => eq(object.template_id, template.id))
        .orderBy(({ object }) => object.updated_at, "desc"),
    [template.id],
  );
  const relationFields = useMemo(
    () =>
      buildRelationFields({
        graph: templateGraph,
        toType: primaryType,
        templateObjects: templateObjectsById,
      }).filter((field) =>
        relation?.fromObjectType ? field.fromObjectType !== relation.fromObjectType : true,
      ),
    [primaryType, relation?.fromObjectType, templateGraph, templateObjectsById],
  );

  const createObjectMutation = useMutation({
    mutationFn: async (value: CreateObjectFormValues) => {
      const objectId = draftId;
      const now = new Date();
      const metadata = buildMetadataPayload(metadataFields, value.metadata);

      console.log("metadata", metadata);

      await objectCollection.insert({
        id: objectId,
        owner_id: ownerId,
        template_id: template.id,
        type: primaryType,
        name: value.name.trim(),
        metadata: metadata,
        created_at: now,
        updated_at: now,
      }).isPersisted.promise;

      const richtextDrafts = buildRichtextDrafts(metadataFields, value.metadata);
      const relationEntries = buildRelationEntries({
        relation,
        relationFields,
        relationSelections: value.relations,
        templateGraph,
        primaryType,
      });
      if (richtextDrafts.length === 0 && relationEntries.size === 0) {
        return;
      }
      await persistRelationAndUpdates({ objectId, relationEntries, richtextDrafts });
    },
  });

  const defaultValues: CreateObjectFormValues = {
    name: "",
    metadata: initialMetadataValues,
    relations: [],
  };
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: z.object({
        name: objectSchema.create.shape.name,
        metadata: buildMetadataSchema(metadataFields),
        relations: z.array(
          z.object({
            fieldId: z.string(),
            fromObjectType: z.string(),
            relationType: objectTemplateRelationSchema.shape.type,
            fromObjectId: z.string(),
          }),
        ),
      }),
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await createObjectMutation.mutateAsync(value);
        formApi.reset();
        toast.success("Item created.");
        createObjectDialog.close();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create item.");
      }
    },
  });

  return (
    <AlertDialog
      handle={createObjectDialog}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setDraftId(crypto.randomUUID());
        }
      }}
    >
      <AlertDialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Create new {templateLabel}</AlertDialogTitle>
          </AlertDialogHeader>
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <FormFieldLayout
                    label="Name"
                    htmlFor={field.name}
                    required
                    isInvalid={isInvalid}
                    errors={field.state.meta.errors}
                  >
                    <Input
                      id={field.name}
                      placeholder="Enter a Name..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      autoFocus
                    />
                  </FormFieldLayout>
                );
              }}
            </form.Field>
            <ObjectMetadataFields fields={visibleMetadataFields} form={form} resetKey={draftId} />
            <ObjectRelationFields fields={relationFields} form={form} />
          </FieldGroup>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => form.reset()}>Cancel</AlertDialogCancel>
            <form.Subscribe>
              {(state) => (
                <AlertDialogAction
                  type="submit"
                  disabled={!state.canSubmit || createObjectMutation.isPending}
                >
                  {createObjectMutation.isPending ? "Creating..." : "Create"}
                </AlertDialogAction>
              )}
            </form.Subscribe>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { createObjectDialog };
