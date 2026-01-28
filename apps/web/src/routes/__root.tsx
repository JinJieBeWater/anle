import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { orpc } from "@/utils/orpc";

import "../index.css";
import { SystemProvider } from "@/components/providers/system-provider";
import type { PowerSyncDatabase } from "@powersync/web";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  db: PowerSyncDatabase;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "anle",
      },
      {
        name: "description",
        content: "anle is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <SystemProvider>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            <Outlet />
          </div>
          <Toaster richColors />
        </SystemProvider>
      </ThemeProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
