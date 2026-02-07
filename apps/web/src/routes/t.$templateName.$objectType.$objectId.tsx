import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import { GuardBySync } from "@/components/guard-by-sync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { objectCollection, objectTemplateCollection } from "@/lib/collections";
import { RichtextEditorCard } from "@/components/richtext-editor-card";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import {
  buildTemplateGraph,
  getTemplateObjectByType,
  getTemplateObjectLabel,
  hasTemplateObjectType,
} from "@/lib/object-template";

type MetadataRecord = Record<string, unknown> | null | undefined;

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (value) => value.toUpperCase());

const formatValue = (value: unknown, type?: string) => {
  if (type === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
};

export const Route = createFileRoute("/t/$templateName/$objectType/$objectId")({
  beforeLoad: async ({ params: { templateName, objectType } }) => {
    const templates = await objectTemplateCollection.toArrayWhenReady();
    const template = templates.find((item) => item.name === templateName);
    if (!template) {
      throw notFound();
    }
    const templateGraph = buildTemplateGraph(template);
    if (!hasTemplateObjectType(templateGraph, objectType)) {
      throw notFound();
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { templateName, objectType, objectId } = Route.useParams();
  const { data: template } = useLiveQuery(
    (q) =>
      q
        .from({ objectTemplate: objectTemplateCollection })
        .where(({ objectTemplate }) => eq(objectTemplate.name, templateName))
        .findOne(),
    [templateName],
  );

  const { data: object, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ object: objectCollection })
        .where(({ object }) => eq(object.id, objectId))
        .findOne(),
    [objectId],
  );

  if (!template) throw shouldNeverHappen(`Template not found: ${templateName}`);

  const templateGraph = useMemo(() => buildTemplateGraph(template), [template]);
  const templateObject = getTemplateObjectByType(templateGraph, objectType);
  if (!templateObject) {
    throw shouldNeverHappen(`Object type not found: ${objectType}`);
  }

  if (!object) {
    if (isLoading) {
      return (
        <GuardBySync>
          <div className="mx-auto w-full max-w-5xl px-6 py-8 space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-48" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </GuardBySync>
      );
    }
    throw notFound();
  }

  if (object.template_id !== template.id || object.type !== objectType) {
    throw notFound();
  }

  const metadata = (object.metadata ?? {}) as MetadataRecord;
  const metadataFields = templateObject.metadata ?? [];
  const richtextFields = metadataFields.filter((field) => field.type === "richtext");
  const propertyFields = metadataFields.filter((field) => field.type !== "richtext");
  const itemLabel = getTemplateObjectLabel(templateObject);

  return (
    <GuardBySync>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <Link
          to="/t/$templateName/$objectType"
          params={{ templateName, objectType }}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to {itemLabel}
        </Link>

        <div className="mt-3">
          <div className="text-2xl font-semibold">{object.name?.trim() || "Untitled entry"}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {template.name} / {itemLabel}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
          <div className="space-y-6">
            {richtextFields.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No richtext fields configured for this type.
                </CardContent>
              </Card>
            ) : (
              richtextFields.map((field) => (
                <RichtextEditorCard
                  key={field.key}
                  objectId={object.id}
                  fieldKey={field.key}
                  title={formatLabel(field.key)}
                />
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {propertyFields.length === 0 ? (
                  <div className="text-muted-foreground">No properties configured.</div>
                ) : (
                  propertyFields.map((field) => {
                    const value =
                      metadata && typeof metadata === "object" ? metadata[field.key] : undefined;
                    return (
                      <div key={field.key} className="flex items-start justify-between gap-4">
                        <div className="text-muted-foreground">{formatLabel(field.key)}</div>
                        <div className="text-right font-medium wrap-break-word">
                          {formatValue(value, field.type)}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GuardBySync>
  );
}
