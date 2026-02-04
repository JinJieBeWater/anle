import { createFileRoute } from "@tanstack/react-router";

import { TemplatesHome } from "@/components/templates-home";

export const Route = createFileRoute("/")({
  component: TemplatesHome,
});
