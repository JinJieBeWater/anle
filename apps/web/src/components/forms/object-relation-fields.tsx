import { useMemo } from "react";
import { FormFieldLayout } from "@/components/forms/form-field-layout";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateObjectFormApi } from "@/components/forms/object-metadata-fields";
import type { Object as ObjectEntry } from "@/lib/powersync/schema";
import {
  getEdgesTo,
  getRelationTypeBetween,
  getTemplateObjectByType,
  type RelationSelection,
  type TemplateRelation,
  type TemplateGraph,
} from "@/lib/object-template";
import { shouldNeverHappen } from "@/utils/should-never-happen";

type RelationSelectField = {
  id: string;
  fromObjectType: string;
  fromObjectLabel: string;
  relationType: TemplateRelation["type"];
  items: ObjectEntry[];
  nameById: Map<string, string>;
};

export function buildRelationFields({
  graph,
  toType,
  templateObjects,
}: {
  graph: TemplateGraph;
  toType: string;
  templateObjects: ObjectEntry[];
}): RelationSelectField[] {
  const seen = new Set<string>();
  const fields: RelationSelectField[] = [];
  const incomingEdges = getEdgesTo(graph, toType);

  for (const edge of incomingEdges) {
    const id = `${edge.fromType}:${edge.type}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const fromObjectLabel = getTemplateObjectByType(graph, edge.fromType)?.label ?? edge.fromType;
    const items = templateObjects.filter((entry) => entry.type === edge.fromType);
    const nameById = new Map(
      items.map((entry) => [entry.id, entry.name?.trim() || "Untitled entry"]),
    );

    fields.push({
      id,
      fromObjectType: edge.fromType,
      fromObjectLabel,
      relationType: edge.type,
      items,
      nameById,
    });
  }

  return fields;
}

export type RelationContext = {
  fromObjectId: string;
  fromObjectType: string;
};

export type RelationEntry = {
  fromObjectId: string;
  fromObjectType: string;
  relationType: TemplateRelation["type"];
};

export const buildRelationEntries = ({
  relation,
  relationFields,
  relationSelections,
  templateGraph,
  primaryType,
}: {
  relation: RelationContext | undefined;
  relationFields: RelationSelectField[];
  relationSelections: RelationSelection[];
  templateGraph: TemplateGraph;
  primaryType: string;
}) => {
  const allowedRelationIds = new Set(relationFields.map((field) => field.id));
  const relationEntries = relationSelections.reduce<Map<string, RelationEntry>>((map, entry) => {
    if (!allowedRelationIds.has(entry.fieldId)) return map;
    map.set(`${entry.fromObjectId}:${entry.relationType}`, entry);
    return map;
  }, new Map());

  if (relation) {
    const relationType =
      getRelationTypeBetween(templateGraph, relation.fromObjectType, primaryType) ?? "parent";
    relationEntries.set(`${relation.fromObjectId}:${relationType}`, {
      fromObjectId: relation.fromObjectId,
      fromObjectType: relation.fromObjectType,
      relationType,
    });
  }

  return relationEntries;
};

function ObjectRelationFieldRow({
  field,
  value,
  onChange,
}: {
  field: RelationSelectField;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = field.fromObjectLabel;
  const placeholder =
    field.items.length === 0
      ? `No ${field.fromObjectLabel} available`
      : `Select ${field.fromObjectLabel}`;
  const descriptionParts: string[] = [field.relationType];
  if (field.items.length === 0) {
    descriptionParts.push("No available items");
  }
  const description = descriptionParts.join(" | ");

  return (
    <FormFieldLayout
      label={
        <>
          <span>{label}</span>
          <span className="text-muted-foreground text-sm font-normal">{description}</span>
        </>
      }
      htmlFor={`relation-${field.id}`}
      labelClassName="flex w-full items-center justify-between gap-3"
    >
      <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
        <SelectTrigger
          id={`relation-${field.id}`}
          className="w-full"
          aria-invalid={false}
          disabled={field.items.length === 0}
        >
          <SelectValue>
            {(selected) =>
              selected ? (field.nameById.get(selected) ?? "Untitled entry") : placeholder
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="" className="text-muted-foreground">
              none
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            {field.items.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name?.trim() || "Untitled entry"}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </FormFieldLayout>
  );
}

export function ObjectRelationFields({
  fields,
  form,
}: {
  fields: RelationSelectField[];
  form: CreateObjectFormApi;
}) {
  if (fields.length === 0) {
    return null;
  }

  const relationFieldsById = useMemo(
    () => new Map(fields.map((field) => [field.id, field])),
    [fields],
  );

  return (
    <form.Field name="relations">
      {(field) => {
        const currentSelections = Array.isArray(field.state.value)
          ? (field.state.value as RelationSelection[])
          : [];
        const values = currentSelections.reduce<Record<string, string>>((acc, entry) => {
          acc[entry.fieldId] = entry.fromObjectId;
          return acc;
        }, {});

        const handleValueChange = (fieldId: string, nextValue: string) => {
          const relationField = relationFieldsById.get(fieldId);
          if (!relationField) {
            throw shouldNeverHappen("Relation field not found", { fieldId });
          }
          const nextSelections = currentSelections.filter(
            (entry) =>
              !(
                entry.fromObjectType === relationField.fromObjectType &&
                entry.relationType === relationField.relationType
              ),
          );
          if (nextValue) {
            nextSelections.push({
              fieldId: relationField.id,
              fromObjectType: relationField.fromObjectType,
              relationType: relationField.relationType,
              fromObjectId: nextValue,
            });
          }
          field.handleChange(nextSelections);
        };

        return (
          <>
            {fields.map((relationField) => (
              <ObjectRelationFieldRow
                key={relationField.id}
                field={relationField}
                value={values[relationField.id] ?? ""}
                onChange={(value) => handleValueChange(relationField.id, value)}
              />
            ))}
          </>
        );
      }}
    </form.Field>
  );
}
