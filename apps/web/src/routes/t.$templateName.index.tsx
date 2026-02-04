import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/t/$templateName/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/t/$templateName/"!</div>;
}
