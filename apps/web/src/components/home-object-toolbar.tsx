import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { createObjectDialog } from "@/components/dialogs/create-object-dialog";
import { cn } from "@/lib/utils";

type HomeObjectToolbarProps = {
  leftSlot?: ReactNode;
};

export function HomeObjectToolbar({ leftSlot }: HomeObjectToolbarProps) {
  return (
    <div className="mx-auto mt-5 sm:mt-1 w-full max-w-xl">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          leftSlot ? "justify-between" : "justify-end",
        )}
      >
        {leftSlot ? <div className="min-w-0 flex-1">{leftSlot}</div> : null}
        <AlertDialogTrigger
          handle={createObjectDialog}
          render={
            <Button variant={"ghost"}>
              <Plus />
              New
            </Button>
          }
        />
      </div>
    </div>
  );
}
