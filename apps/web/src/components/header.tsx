import { ModeToggle } from "./mode-toggle";
import SyncStatusMenu from "./sync-status-menu";
import UserMenu from "./user-menu";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function Header({ className, ...props }: ComponentProps<"div">) {
  const links: {
    to: string;
    label?: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    params: Record<string, string>;
  }[] = [
    { to: "/", icon: Home, params: {} },
    // { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, params: {} },
    // { to: "/tanstack-db-todos", label: "Todos", icon: ListTodo, params: {} },
    // {
    //   to: "/crdt/$documentId",
    //   label: "CRDT",
    //   icon: FileText,
    //   params: { documentId: "029e0c45-53b0-4ec2-9179-5611f66e2eed" },
    // },
  ];
  return (
    <div
      className={cn("sticky top-0 z-50 flex w-full items-center bg-transparent", className)}
      {...props}
    >
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 justify-between">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label, icon: Icon, params }) => {
            return (
              <Button
                variant={"ghost"}
                size={label ? "default" : "icon"}
                key={to}
                nativeButton={false}
                render={
                  <Link
                    to={to}
                    params={params}
                    className="flex items-center gap-2"
                    aria-label={label}
                  />
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label && <span className="hidden sm:inline">{label}</span>}
              </Button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <SyncStatusMenu />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
