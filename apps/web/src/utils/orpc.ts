import type { AppRouterClient } from "@anle/api/routers/index";

import { env } from "@anle/env/web";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient, queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, _query) => {
      // toast.error(`Error: ${error.message}`, {
      //   action: {
      //     label: "retry",
      //     onClick: query.invalidate,
      //   },
      // });
    },
  }),
});

export const link = new RPCLink({
  url: `${env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);

export const SessionQueryKey = ["auth", "session"] as const;

export const GetSessionQueryOptions = queryOptions({
  queryKey: SessionQueryKey,
  queryFn: () => authClient.getSession(),
  select: (res) => res.data,
});
