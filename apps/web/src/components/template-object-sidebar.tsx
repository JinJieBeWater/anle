import { Link } from "@tanstack/react-router";
import { ChevronLeft, Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { createObjectDialog } from "@/components/dialogs/create-object-dialog";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Object, ObjectTemplate } from "@/lib/powersync/schema";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";

type TemplateObjectSidebarGroup = {
  templateObject: ObjectTemplateConfig["objects"][number];
  items: Object[];
};

type TemplateObjectSidebarProps = {
  templateName: string;
  template: ObjectTemplate;
  outlineLabel: string;
  listTemplateObjects: ObjectTemplateConfig["objects"][number][];
  createTemplateObject?: ObjectTemplateConfig["objects"][number];
  onCreateTargetTypeChange: (type: string) => void;
  isLoading: boolean;
  isHomeObject: boolean;
  currentObjectId: string | null;
  templateObject: ObjectTemplateConfig["objects"][number];
  hasItems: boolean;
  itemLabel: string;
  visibleGroups: TemplateObjectSidebarGroup[];
  getOrderValue: (metadata: unknown) => string | null;
  sidebarProps?: ComponentProps<typeof Sidebar>;
};

export function TemplateObjectSidebar({
  templateName,
  template,
  outlineLabel,
  listTemplateObjects,
  createTemplateObject,
  onCreateTargetTypeChange,
  isLoading,
  isHomeObject,
  currentObjectId,
  templateObject,
  hasItems,
  itemLabel,
  visibleGroups,
  getOrderValue,
  sidebarProps,
}: TemplateObjectSidebarProps) {
  const groupedMap = new Map(visibleGroups.map((group) => [group.templateObject.type, group]));
  const tabsDefaultValue = listTemplateObjects[0]?.type ?? "";

  return (
    <Sidebar {...sidebarProps}>
      <SidebarHeader className="gap-3 px-4 py-3">
        <Link
          to="/t/$templateName"
          params={{ templateName }}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back to {template.name}
        </Link>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Outline
            </div>
            <div className="mt-1 text-sm font-semibold">{outlineLabel}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {listTemplateObjects.length > 1 ? (
              listTemplateObjects.map((objectConfig) => (
                <AlertDialogTrigger
                  key={objectConfig.type}
                  handle={createObjectDialog}
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateTargetTypeChange(objectConfig.type)}
                    >
                      <Plus />
                      New {objectConfig.label ?? objectConfig.type}
                    </Button>
                  }
                />
              ))
            ) : (
              <AlertDialogTrigger
                handle={createObjectDialog}
                render={
                  <Button variant="ghost" size="sm" disabled={!createTemplateObject}>
                    <Plus />
                    New
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />

      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : isHomeObject && !currentObjectId ? (
          <SidebarGroup>
            <SidebarGroupContent className="py-6">
              <Empty>
                <EmptyContent>
                  <EmptyHeader>
                    <EmptyTitle>Select a {templateObject.label ?? templateObject.type}</EmptyTitle>
                  </EmptyHeader>
                  <EmptyDescription>Open a home item to see its children.</EmptyDescription>
                </EmptyContent>
              </Empty>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : listTemplateObjects.length > 1 ? (
          <Tabs defaultValue={tabsDefaultValue} className="w-full">
            <div className="px-2 pt-2">
              <TabsList variant="line" className="w-full justify-start">
                {listTemplateObjects.map((objectConfig) => (
                  <TabsTrigger key={objectConfig.type} value={objectConfig.type}>
                    {objectConfig.label ?? objectConfig.type}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {listTemplateObjects.map((objectConfig) => {
              const group = groupedMap.get(objectConfig.type);
              const items = group?.items ?? [];
              const label = objectConfig.label ?? objectConfig.type;
              return (
                <TabsContent key={objectConfig.type} value={objectConfig.type}>
                  {items.length === 0 ? (
                    <SidebarGroup>
                      <SidebarGroupContent className="py-6">
                        <Empty>
                          <EmptyContent>
                            <EmptyHeader>
                              <EmptyTitle>No {label}s yet</EmptyTitle>
                            </EmptyHeader>
                            <EmptyDescription>
                              Create the first {label} to get started.
                            </EmptyDescription>
                          </EmptyContent>
                        </Empty>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ) : (
                    <SidebarGroup>
                      <SidebarGroupLabel>{label}</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {items.map((entry) => {
                            const orderValue = getOrderValue(entry.metadata);
                            return (
                              <SidebarMenuItem key={entry.id}>
                                <SidebarMenuButton
                                  render={
                                    <Link
                                      to="/t/$templateName/$objectType/$objectId"
                                      params={{
                                        templateName,
                                        objectType: objectConfig.type,
                                        objectId: entry.id,
                                      }}
                                    />
                                  }
                                  isActive={currentObjectId === entry.id}
                                >
                                  <span className="min-w-0 flex-1 truncate">
                                    {entry.name?.trim() || "Untitled entry"}
                                  </span>
                                </SidebarMenuButton>
                                {orderValue ? (
                                  <SidebarMenuBadge>{orderValue}</SidebarMenuBadge>
                                ) : null}
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : !hasItems ? (
          <SidebarGroup>
            <SidebarGroupContent className="py-6">
              <Empty>
                <EmptyContent>
                  <EmptyHeader>
                    <EmptyTitle>No {itemLabel}s yet</EmptyTitle>
                  </EmptyHeader>
                  <EmptyDescription>Create the first {itemLabel} to get started.</EmptyDescription>
                </EmptyContent>
              </Empty>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleGroups[0]?.items.map((entry) => {
                  const orderValue = getOrderValue(entry.metadata);
                  return (
                    <SidebarMenuItem key={entry.id}>
                      <SidebarMenuButton
                        render={
                          <Link
                            to="/t/$templateName/$objectType/$objectId"
                            params={{
                              templateName,
                              objectType: templateObject.type,
                              objectId: entry.id,
                            }}
                          />
                        }
                        isActive={currentObjectId === entry.id}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {entry.name?.trim() || "Untitled entry"}
                        </span>
                      </SidebarMenuButton>
                      {orderValue ? <SidebarMenuBadge>{orderValue}</SidebarMenuBadge> : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
