import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import SyncStatusMenu from "./sync-status-menu";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home", params: {} },
    { to: "/dashboard", label: "Dashboard", params: {} },
    { to: "/tanstack-db-todos", label: "Todos", params: {} },
    {
      to: "/crdt/$documentId",
      label: "CRDT",
      params: { documentId: "029e0c45-53b0-4ec2-9179-5611f66e2eed" },
    },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label, params }) => {
            return (
              <Link key={to} to={to} params={params}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <SyncStatusMenu />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
