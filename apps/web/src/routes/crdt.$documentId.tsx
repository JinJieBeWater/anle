import { createFileRoute } from "@tanstack/react-router";
import { objectCollection, objectTemplateCollection } from "@/lib/collections";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { GuardBySync } from "@/components/guard-by-sync";
import { RichtextEditorCard } from "@/components/richtext-editor-card";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export const Route = createFileRoute("/crdt/$documentId")({
  component: RouteComponent,
  loader: async ({ params: { documentId }, context: { getAppSession } }) => {
    const defaultTemplateConfig: ObjectTemplateConfig = {
      objects: [
        {
          type: "entry",
          label: "Entry",
          metadata: [
            {
              key: "content",
              type: "richtext",
            },
          ],
        },
      ],
    };
    const getTemplateType = (config?: typeof defaultTemplateConfig | null) => {
      const objects = config?.objects ?? [];
      if (objects.length === 0) {
        return { type: defaultTemplateConfig.objects[0].type, needsPatch: true };
      }
      const primary = objects[0];
      if (!primary?.type) {
        return { type: defaultTemplateConfig.objects[0].type, needsPatch: true };
      }
      return { type: primary.type, needsPatch: false };
    };
    const defaultTemplateName = "CRDT示例";
    const getTemplateName = (_id: string) => defaultTemplateName;
    const { userId: ownerId } = getAppSession();
    const state = await objectCollection.stateWhenReady();
    const existing = state.get(documentId);
    if (existing) {
      const templateState = await objectTemplateCollection.stateWhenReady();
      const templateId = existing.template_id || documentId;
      const templateExists = templateState.get(templateId);
      if (!templateExists) {
        await objectTemplateCollection.insert({
          id: templateId,
          owner_id: ownerId,
          name: getTemplateName(templateId),
          config: defaultTemplateConfig,
          created_at: new Date(),
          updated_at: new Date(),
        }).isPersisted.promise;
      } else {
        const { needsPatch } = getTemplateType(templateExists.config ?? defaultTemplateConfig);
        const needsNamePatch = !templateExists.name?.trim();
        if (needsPatch || needsNamePatch) {
          await objectTemplateCollection.update(templateId, (draft) => {
            if (needsPatch) {
              draft.config = defaultTemplateConfig;
            }
            if (needsNamePatch) {
              draft.name = getTemplateName(templateId);
            }
            draft.updated_at = new Date();
          }).isPersisted.promise;
        }
      }
      if (!existing.template_id) {
        await objectCollection.update(documentId, (draft) => {
          draft.template_id = templateId;
          draft.updated_at = new Date();
        }).isPersisted.promise;
      }
      return;
    }
    const templateId = documentId;
    const templateState = await objectTemplateCollection.stateWhenReady();
    const templateExists = templateState.get(templateId);
    if (!templateExists) {
      await objectTemplateCollection.insert({
        id: templateId,
        owner_id: ownerId,
        name: getTemplateName(templateId),
        config: defaultTemplateConfig,
        created_at: new Date(),
        updated_at: new Date(),
      }).isPersisted.promise;
    } else if (!templateExists.name?.trim()) {
      await objectTemplateCollection.update(templateId, (draft) => {
        draft.name = getTemplateName(templateId);
        draft.updated_at = new Date();
      }).isPersisted.promise;
    }
    const { type } = getTemplateType(templateExists?.config ?? defaultTemplateConfig);
    await objectCollection.insert({
      id: documentId,
      owner_id: ownerId,
      template_id: templateId,
      type,
      name: "Untitled entry",
      metadata: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date(),
    }).isPersisted.promise;
  },
});

function RouteComponent() {
  const { documentId } = Route.useParams();

  const { data: object } = useLiveQuery(
    (q) =>
      q
        .from({ object: objectCollection })
        .where(({ object }) => eq(object.id, documentId))
        .findOne(),
    [documentId],
  );

  if (!object) throw shouldNeverHappen("Object not found");

  return (
    <GuardBySync>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <RichtextEditorCard
          objectId={documentId}
          fieldKey="content"
          title={object.name}
          description="PowerSync + TipTap integration example."
        />
      </div>
    </GuardBySync>
  );
}
