"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { GridBulkAction, GridBulkActionContext } from "./types"

type DataGridToolbarProps<T> = {
  quickFilterText: string
  onQuickFilterTextChange: (value: string) => void
  bulkContext: GridBulkActionContext<T>
  bulkActions?: GridBulkAction<T>[]
  renderBulkActions?: (ctx: GridBulkActionContext<T>) => ReactNode
  className?: string
}

export function DataGridToolbar<T>({
  quickFilterText,
  onQuickFilterTextChange,
  bulkContext,
  bulkActions,
  renderBulkActions,
  className,
}: DataGridToolbarProps<T>) {
  const hasSelection = bulkContext.selectedIds.length > 0
  const showBulk =
    hasSelection && (Boolean(renderBulkActions) || (bulkActions?.length ?? 0) > 0)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={quickFilterText}
          onChange={(event) => onQuickFilterTextChange(event.target.value)}
          placeholder="Search…"
          className="ps-9"
          aria-label="Quick filter"
        />
      </div>

      {showBulk ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-2">
          <p className="text-sm text-muted-foreground">
            {bulkContext.selectedIds.length} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {renderBulkActions ? (
              renderBulkActions(bulkContext)
            ) : (
              <>
                {bulkActions?.map((action) => {
                  const disabled =
                    typeof action.disabled === "function"
                      ? action.disabled(bulkContext)
                      : Boolean(action.disabled)

                  return (
                    <Button
                      key={action.id}
                      type="button"
                      size="sm"
                      variant={action.variant ?? "outline"}
                      disabled={disabled}
                      onClick={() => action.onClick(bulkContext)}
                    >
                      {action.label}
                    </Button>
                  )
                })}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={bulkContext.clearSelection}
                >
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
