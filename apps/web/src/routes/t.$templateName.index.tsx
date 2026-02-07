import { createFileRoute, notFound } from "@tanstack/react-router";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { useMemo } from "react";

import { GuardBySync } from "@/components/guard-by-sync";
import { objectCollection, objectTemplateCollection } from "@/lib/collections";
import { useAppSession } from "@/hooks/use-app-session";
import { AuthStatusBadge, SyncStatusBadge } from "@/components/status-badges";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { HomeObjectSection } from "@/components/home-object-section";
import { HomeObjectToolbar } from "@/components/home-object-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildTemplateGraph, getHomeTemplateObjects } from "@/lib/object-template";

export const Route = createFileRoute("/t/$templateName/")({
  beforeLoad: async ({ params: { templateName } }) => {
    const templates = await objectTemplateCollection.toArrayWhenReady();
    const templateExists = templates.some((template) => template.name === templateName);
    if (!templateExists) {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { templateName } = Route.useParams();
  const { userId } = useAppSession();
  const { data: template } = useLiveQuery(
    (q) =>
      q
        .from({ objectTemplate: objectTemplateCollection })
        .where(({ objectTemplate }) => eq(objectTemplate.name, templateName))
        .findOne(),
    [templateName],
  );

  if (!template || !template.config) throw shouldNeverHappen("Error");
  const templateGraph = useMemo(() => buildTemplateGraph(template), [template]);
  const homeObjectTemplates = useMemo(() => getHomeTemplateObjects(templateGraph), [templateGraph]);
  const defaultHomeObject = homeObjectTemplates[0];
  if (!defaultHomeObject) throw shouldNeverHappen("Error");

  const { data: objects, isLoading: isObjectsLoading } = useLiveQuery(
    (q) =>
      q
        .from({ object: objectCollection })
        .where(({ object }) => eq(object.template_id, template.id))
        .orderBy(({ object }) => object.updated_at, "desc"),
    [template.id],
  );

  const homeObjectTabsList = useMemo(
    () =>
      homeObjectTemplates.length > 0 ? (
        <TabsList variant="line">
          {homeObjectTemplates.map((homeObject: (typeof homeObjectTemplates)[number]) => (
            <TabsTrigger key={homeObject.type} value={homeObject.type}>
              {homeObject.label ?? homeObject.type}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null,
    [homeObjectTemplates],
  );
  return (
    <GuardBySync>
      <div className="relative min-h-[calc(100svh-var(--header-height))] py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mt-[10svh]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Home
            </div>
            <div className="mt-2 font-semibold text-2xl">{template.name.toLocaleUpperCase()}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Browse entries created from this template.
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <AuthStatusBadge />
              <SyncStatusBadge />
            </div>
          </div>

          {homeObjectTabsList ? (
            <Tabs defaultValue={defaultHomeObject.type}>
              {homeObjectTemplates.map((homeObject: (typeof homeObjectTemplates)[number]) => (
                <TabsContent key={homeObject.type} value={homeObject.type}>
                  <HomeObjectToolbar leftSlot={homeObjectTabsList} />
                  <HomeObjectSection
                    template={template}
                    templateObject={homeObject}
                    objects={objects}
                    isLoading={isObjectsLoading}
                    ownerId={userId}
                  />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <>
              <HomeObjectToolbar />
              <HomeObjectSection
                template={template}
                templateObject={defaultHomeObject}
                objects={objects}
                isLoading={isObjectsLoading}
                ownerId={userId}
              />
            </>
          )}
        </div>
      </div>
    </GuardBySync>
  );
}
