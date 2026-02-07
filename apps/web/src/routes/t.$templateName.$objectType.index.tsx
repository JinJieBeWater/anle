import { createFileRoute } from "@tanstack/react-router";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute("/t/$templateName/$objectType/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { objectType } = Route.useParams();

  return (
    <div className="flex min-h-[calc(100svh-var(--header-height))] items-center justify-center px-6 py-8">
      <Empty>
        <EmptyContent>
          <EmptyHeader>
            <EmptyTitle>Select a {objectType}</EmptyTitle>
          </EmptyHeader>
          <EmptyDescription>Pick an item from the outline to open its details.</EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
