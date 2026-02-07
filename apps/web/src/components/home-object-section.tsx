import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateObjectDialog } from "@/components/dialogs/create-object-dialog";
import type { Object } from "@/lib/powersync/schema";
import type { ObjectTemplate } from "@/lib/powersync/schema";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";

type HomeObjectSectionProps = {
  template: ObjectTemplate;
  templateObject: ObjectTemplateConfig["objects"][number];
  objects: Object[];
  isLoading: boolean;
  ownerId: string;
};

const hashToHue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
};

export function HomeObjectSection({
  template,
  templateObject,
  objects,
  isLoading,
  ownerId,
}: HomeObjectSectionProps) {
  const itemLabel = templateObject.label ?? templateObject.type;
  const visibleObjects = objects.filter((entry) => entry.type === templateObject.type);

  return (
    <>
      <CreateObjectDialog template={template} templateObject={templateObject} ownerId={ownerId} />

      <div className="mt-4">
        {isLoading ? (
          <div className="grid w-full gap-3 max-sm:grid-cols-[repeat(auto-fit,minmax(172px,1fr))] sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-full sm:w-60">
                <Card className="relative bg-card text-card-foreground">
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-1.5 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end">
                    <div className="h-5 w-10" />
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        ) : visibleObjects.length === 0 ? (
          <Empty>
            <EmptyContent>
              <EmptyHeader>
                <EmptyTitle>No {itemLabel}s yet</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>Create the first {itemLabel} to get started.</EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid w-full gap-3 max-sm:grid-cols-[repeat(auto-fit,minmax(172px,1fr))] sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
            {visibleObjects.map((entry) => {
              const hue = hashToHue(entry.name);
              const entryStyle = {
                "--template-accent": `hsl(${hue} 70% 45%)`,
              } as CSSProperties;

              return (
                <Link
                  key={entry.id}
                  to="/t/$templateName/$objectType/$objectId"
                  params={{
                    templateName: template.name,
                    objectType: entry.type,
                    objectId: entry.id,
                  }}
                  className="w-full sm:w-60"
                >
                  <Card className="relative bg-card text-card-foreground" style={entryStyle}>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm font-semibold leading-tight">
                        <span className="size-1.5 rounded-full bg-(--template-accent)" />
                        {entry.name?.trim() || "Untitled entry"}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end text-xs text-muted-foreground">
                      Open
                      <ArrowRight className="ml-1 size-3.5" />
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
