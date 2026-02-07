import { Outlet, createFileRoute, notFound, useRouterState } from "@tanstack/react-router";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { useEffect, useMemo, useState } from "react";

import { GuardBySync } from "@/components/guard-by-sync";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  objectCollection,
  objectRelationCollection,
  objectTemplateCollection,
} from "@/lib/collections";
import { CreateObjectDialog } from "@/components/dialogs/create-object-dialog";
import { useAppSession } from "@/hooks/use-app-session";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { TemplateObjectSidebar } from "@/components/template-object-sidebar";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";
import {
  buildTemplateGraph,
  getEdgesFrom,
  getRelationTargetTypes,
  getTemplateObjectByType,
  getTemplateObjectLabel,
} from "@/lib/object-template";

type MetadataRecord = Record<string, unknown>;

const getOrderValue = (metadata: unknown) => {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = (metadata as MetadataRecord).order;
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  return value ? value : null;
};

const sortByOrderThenUpdated = <T extends { metadata?: unknown; updated_at: Date }>(items: T[]) => {
  return [...items].sort((a, b) => {
    const orderA = getOrderValue(a.metadata);
    const orderB = getOrderValue(b.metadata);
    if (orderA && orderB && orderA !== orderB) {
      return orderA.localeCompare(orderB, undefined, { numeric: true });
    }
    if (orderA && !orderB) return -1;
    if (!orderA && orderB) return 1;
    return b.updated_at.getTime() - a.updated_at.getTime();
  });
};

export const Route = createFileRoute("/t/$templateName/$objectType")({
  beforeLoad: async ({ params: { templateName, objectType } }) => {
    const templates = await objectTemplateCollection.toArrayWhenReady();
    const template = templates.find((item) => item.name === templateName);
    if (!template) {
      throw notFound();
    }
    const templateGraph = buildTemplateGraph(template);
    const templateObject = getTemplateObjectByType(templateGraph, objectType);
    if (!templateObject) {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { templateName, objectType } = Route.useParams();
  const { userId } = useAppSession();
  const currentObjectId = useRouterState({
    select: (state) => {
      for (const match of state.matches) {
        const params = match.params as Record<string, string>;
        if (params.objectId) {
          return params.objectId;
        }
      }
      return null;
    },
  });
  const { data: template } = useLiveQuery(
    (q) =>
      q
        .from({ objectTemplate: objectTemplateCollection })
        .where(({ objectTemplate }) => eq(objectTemplate.name, templateName))
        .findOne(),
    [templateName],
  );

  if (!template) throw shouldNeverHappen(`Template not found: ${templateName}`);

  const templateGraph = useMemo(() => buildTemplateGraph(template), [template]);
  const templateObject = getTemplateObjectByType(templateGraph, objectType);
  if (!templateObject) {
    throw shouldNeverHappen(`Object type not found: ${objectType}`);
  }
  const isHomeObject = templateObject.page === "home";
  const childRelations = getEdgesFrom(templateGraph, templateObject.type, "parent");
  const childTypes = getRelationTargetTypes(childRelations);
  const listObjectTypes =
    isHomeObject && childTypes.length > 0 ? childTypes : [templateObject.type];
  const listObjectTypesKey = listObjectTypes.join("|");
  const listTemplateObjects = useMemo(
    () =>
      listObjectTypes
        .map((type) => getTemplateObjectByType(templateGraph, type))
        .filter(Boolean) as ObjectTemplateConfig["objects"][number][],
    [listObjectTypesKey, templateGraph],
  );
  const [createTargetType, setCreateTargetType] = useState(listTemplateObjects[0]?.type ?? "");
  useEffect(() => {
    if (!listTemplateObjects.some((object) => object.type === createTargetType)) {
      setCreateTargetType(listTemplateObjects[0]?.type ?? "");
    }
  }, [createTargetType, listTemplateObjects]);
  const createTemplateObject =
    listTemplateObjects.find((object) => object.type === createTargetType) ??
    listTemplateObjects[0];
  const templateId = template.id;
  const { data: objects = [], isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ object: objectCollection })
        .where(({ object }) => eq(object.template_id, templateId))
        .orderBy(({ object }) => object.updated_at, "desc"),
    [templateId],
  );
  const objectIdFilter = currentObjectId ?? "__none__";
  const { data: relationsFrom = [] } = useLiveQuery(
    (q) =>
      q
        .from({ objectRelation: objectRelationCollection })
        .where(({ objectRelation }) => eq(objectRelation.from_object_id, objectIdFilter)),
    [objectIdFilter],
  );
  const { data: relationsTo = [] } = useLiveQuery(
    (q) =>
      q
        .from({ objectRelation: objectRelationCollection })
        .where(({ objectRelation }) => eq(objectRelation.to_object_id, objectIdFilter)),
    [objectIdFilter],
  );

  const shouldFilterChildren =
    isHomeObject && Boolean(currentObjectId) && childRelations.length > 0;
  const relationTypes = new Set(childRelations.map((relation) => relation.type));
  const relatedIds = shouldFilterChildren
    ? new Set(
        [...relationsFrom, ...relationsTo]
          .filter((relation) => relationTypes.size === 0 || relationTypes.has(relation.type))
          .map((relation) =>
            relation.from_object_id === currentObjectId
              ? relation.to_object_id
              : relation.from_object_id,
          ),
      )
    : new Set<string>();

  const listCandidates = objects.filter((entry) => listObjectTypes.includes(entry.type));
  const listFiltered = shouldFilterChildren
    ? listCandidates.filter((entry) => relatedIds.has(entry.id))
    : isHomeObject && !currentObjectId
      ? []
      : listCandidates;

  const groupedObjects = listTemplateObjects.map((objectConfig) => ({
    templateObject: objectConfig,
    items: sortByOrderThenUpdated(listFiltered.filter((entry) => entry.type === objectConfig.type)),
  }));
  const visibleGroups = groupedObjects.filter((group) => group.items.length > 0);
  const hasItems = visibleGroups.length > 0;
  const itemLabel = createTemplateObject ? getTemplateObjectLabel(createTemplateObject) : "item";
  const outlineLabel = listTemplateObjects.length > 1 ? "Children" : itemLabel;

  return (
    <GuardBySync>
      <SidebarProvider className="min-h-[calc(100svh-var(--header-height))]">
        <TemplateObjectSidebar
          templateName={templateName}
          template={template}
          outlineLabel={outlineLabel}
          listTemplateObjects={listTemplateObjects}
          createTemplateObject={createTemplateObject}
          onCreateTargetTypeChange={setCreateTargetType}
          isLoading={isLoading}
          isHomeObject={isHomeObject}
          currentObjectId={currentObjectId}
          templateObject={templateObject}
          hasItems={hasItems}
          itemLabel={itemLabel}
          visibleGroups={visibleGroups}
          getOrderValue={getOrderValue}
          sidebarProps={{
            className: "top-(--header-height) h-[calc(100svh-var(--header-height))]!",
            variant: "floating",
          }}
        />

        <SidebarRail />

        <SidebarInset>
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold">{outlineLabel}</div>
          </div>
          {createTemplateObject ? (
            <CreateObjectDialog
              template={template}
              templateObject={createTemplateObject}
              ownerId={userId}
              relation={
                isHomeObject && currentObjectId && childRelations.length > 0
                  ? {
                      fromObjectId: currentObjectId,
                      fromObjectType: templateObject.type,
                    }
                  : undefined
              }
            />
          ) : null}
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </GuardBySync>
  );
}
