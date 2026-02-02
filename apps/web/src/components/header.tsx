import { Link } from "@tanstack/react-router";
import { FileText, Home, LayoutDashboard, ListTodo } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import SyncStatusMenu from "./sync-status-menu";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home", icon: Home, params: {} },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, params: {} },
    { to: "/tanstack-db-todos", label: "Todos", icon: ListTodo, params: {} },
    {
      to: "/crdt/$documentId",
      label: "CRDT",
      icon: FileText,
      params: { documentId: "029e0c45-53b0-4ec2-9179-5611f66e2eed" },
    },
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label, icon: Icon, params }) => {
            return (
              <Link
                key={to}
                to={to}
                params={params}
                className="flex items-center gap-2"
                aria-label={label}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
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
