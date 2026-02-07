import type { ObjectTemplate } from "@/lib/powersync/schema";
import type { ObjectTemplateConfig } from "@anle/db/schema/object-template";

export type TemplateObject = ObjectTemplateConfig["objects"][number];
export type TemplateRelation = NonNullable<TemplateObject["relations"]>[number];

export type RelationSelection = {
  fieldId: string;
  fromObjectType: string;
  relationType: TemplateRelation["type"];
  fromObjectId: string;
};

export type TemplateRelationEdge = {
  fromType: string;
  toType: string;
  type: TemplateRelation["type"];
};

export type TemplateGraph = {
  objects: TemplateObject[];
  edges: TemplateRelationEdge[];
  edgesByType: Map<TemplateRelation["type"], TemplateRelationEdge[]>;
  edgesFrom: Map<string, TemplateRelationEdge[]>;
  edgesTo: Map<string, TemplateRelationEdge[]>;
};

function pushEdge<T>(map: Map<string, T[]>, key: string, value: T): void {
  const list = map.get(key);
  if (list) {
    list.push(value);
    return;
  }
  map.set(key, [value]);
}

function pushTypedEdge(
  map: Map<TemplateRelation["type"], TemplateRelationEdge[]>,
  key: TemplateRelation["type"],
  value: TemplateRelationEdge,
): void {
  const list = map.get(key);
  if (list) {
    list.push(value);
    return;
  }
  map.set(key, [value]);
}

export function buildTemplateGraph(template: ObjectTemplate): TemplateGraph {
  const objects = template?.config?.objects ?? [];
  const edges: TemplateRelationEdge[] = [];
  const edgesByType = new Map<TemplateRelation["type"], TemplateRelationEdge[]>();
  const edgesFrom = new Map<string, TemplateRelationEdge[]>();
  const edgesTo = new Map<string, TemplateRelationEdge[]>();

  for (const object of objects) {
    const relations = object.relations ?? [];
    for (const relation of relations) {
      const edge: TemplateRelationEdge = {
        fromType: object.type,
        toType: relation.targetType,
        type: relation.type,
      };
      edges.push(edge);
      pushTypedEdge(edgesByType, edge.type, edge);
      pushEdge(edgesFrom, edge.fromType, edge);
      pushEdge(edgesTo, edge.toType, edge);
    }
  }

  return {
    objects,
    edges,
    edgesByType,
    edgesFrom,
    edgesTo,
  };
}

export function getTemplateObjectByType(
  graph: TemplateGraph,
  objectType: string,
): TemplateObject | undefined {
  return graph.objects.find((object) => object.type === objectType);
}

export function hasTemplateObjectType(graph: TemplateGraph, objectType: string): boolean {
  return graph.objects.some((object) => object.type === objectType);
}

export function getHomeTemplateObjects(graph: TemplateGraph): TemplateObject[] {
  return graph.objects.filter((object) => object.page === "home");
}

export function getTemplateObjectLabel(
  templateObject: TemplateObject,
  fallback: string = "item",
): string {
  return templateObject.label ?? templateObject.type ?? fallback;
}

export function getEdgesByType(
  graph: TemplateGraph,
  relationType: TemplateRelation["type"],
): TemplateRelationEdge[] {
  return graph.edgesByType.get(relationType) ?? [];
}

export function getEdgesFrom(
  graph: TemplateGraph,
  fromType: string,
  relationType?: TemplateRelation["type"],
): TemplateRelationEdge[] {
  const edges = graph.edgesFrom.get(fromType) ?? [];
  if (!relationType) {
    return edges;
  }
  return edges.filter((edge) => edge.type === relationType);
}

export function getEdgesTo(
  graph: TemplateGraph,
  toType: string,
  relationType?: TemplateRelation["type"],
): TemplateRelationEdge[] {
  const edges = graph.edgesTo.get(toType) ?? [];
  if (!relationType) {
    return edges;
  }
  return edges.filter((edge) => edge.type === relationType);
}

export function getRelationTypeBetween(
  graph: TemplateGraph,
  fromType: string,
  toType: string,
): TemplateRelation["type"] | undefined {
  const edges = getEdgesFrom(graph, fromType);
  return edges.find((edge) => edge.toType === toType)?.type;
}

export function getRelationTargetTypes(edges: TemplateRelationEdge[]): string[] {
  return Array.from(new Set(edges.map((edge) => edge.toType)));
}
