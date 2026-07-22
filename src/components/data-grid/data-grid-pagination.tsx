"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { GridPaginationModel } from "./types"

type DataGridPaginationProps = {
  paginationModel: GridPaginationModel
  onPaginationModelChange: (model: GridPaginationModel) => void
  pageSizeOptions: number[]
  rowCount: number
  className?: string
}

export function DataGridPagination({
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions,
  rowCount,
  className,
}: DataGridPaginationProps) {
  const { page, pageSize } = paginationModel
  const pageCount = Math.max(1, Math.ceil(rowCount / pageSize) || 1)
  const currentPage = Math.min(page, pageCount - 1)
  const from = rowCount === 0 ? 0 : currentPage * pageSize + 1
  const to = Math.min(rowCount, (currentPage + 1) * pageSize)

  const pageSizeItems = Object.fromEntries(
    pageSizeOptions.map((size) => [String(size), String(size)])
  )

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <Select
          value={String(pageSize)}
          items={pageSizeItems}
          onValueChange={(value) => {
            if (value == null) return
            onPaginationModelChange({ page: 0, pageSize: Number(value) })
          }}
        >
          <SelectTrigger size="sm" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <span>
          {from}-{to} of {rowCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Previous page"
            disabled={currentPage <= 0}
            onClick={() =>
              onPaginationModelChange({ page: currentPage - 1, pageSize })
            }
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="rtl:rotate-180"
            />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() =>
              onPaginationModelChange({ page: currentPage + 1, pageSize })
            }
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="rtl:rotate-180"
            />
          </Button>
        </div>
      </div>
    </div>
  )
}
