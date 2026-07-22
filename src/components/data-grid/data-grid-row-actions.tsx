"use client"

import type { ReactNode } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { GridRowAction, GridRowActionContext } from "./types"

type DataGridRowActionsProps<T> = {
  context: GridRowActionContext<T>
  actions: GridRowAction<T>[]
  display?: "menu" | "buttons"
  renderRowActions?: (ctx: GridRowActionContext<T>) => ReactNode
}

function isDisabled<T>(
  action: GridRowAction<T>,
  context: GridRowActionContext<T>
): boolean {
  return typeof action.disabled === "function"
    ? action.disabled(context)
    : Boolean(action.disabled)
}

export function DataGridRowActions<T>({
  context,
  actions,
  display = "menu",
  renderRowActions,
}: DataGridRowActionsProps<T>) {
  if (renderRowActions) {
    return <>{renderRowActions(context)}</>
  }

  if (actions.length === 0) {
    return null
  }

  if (display === "buttons") {
    return (
      <div
        className="inline-flex flex-wrap items-center justify-end gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
            type="button"
            size="sm"
            variant={action.variant ?? "ghost"}
            disabled={isDisabled(action, context)}
            onClick={() => action.onClick(context)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex justify-end"
      onClick={(event) => event.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-xs" }),
            "shrink-0"
          )}
          aria-label="Row actions"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              disabled={isDisabled(action, context)}
              variant={
                action.variant === "destructive" ? "destructive" : "default"
              }
              onClick={() => action.onClick(context)}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
