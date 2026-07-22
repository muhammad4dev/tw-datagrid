"use client"

import { Fragment, useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DataGridColumnFilter } from "./data-grid-column-filter"
import { DataGridPagination } from "./data-grid-pagination"
import { DataGridRowActions } from "./data-grid-row-actions"
import { DataGridToolbar } from "./data-grid-toolbar"
import { defaultGetRowId, getRowValue } from "./get-row-value"
import {
  applyColumnFilters,
  applyPagination,
  applyQuickFilter,
  applySort,
  getColumnFilterOptions,
} from "./pipeline"
import type {
  DataGridProps,
  GridBulkActionContext,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "./types"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50]
const DEFAULT_PAGINATION: GridPaginationModel = { page: 0, pageSize: 10 }
const DEFAULT_FILTER_MODEL: GridFilterModel = { items: [] }

export function DataGrid<T>({
  rows,
  columns,
  getRowId = defaultGetRowId,
  direction,
  sortingMode = "client",
  filterMode = "client",
  paginationMode = "client",
  sortModel: sortModelProp,
  onSortModelChange,
  quickFilterText: quickFilterTextProp,
  onQuickFilterTextChange,
  filterModel: filterModelProp,
  onFilterModelChange,
  paginationModel: paginationModelProp,
  onPaginationModelChange,
  rowCount: rowCountProp,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  checkboxSelection = false,
  rowSelectionModel: rowSelectionModelProp,
  onRowSelectionModelChange,
  bulkActions,
  renderBulkActions,
  rowActions,
  renderRowActions,
  rowActionsDisplay = "menu",
  getDetailPanelContent,
  getRowCanExpand,
  loading = false,
  emptyMessage = "No rows",
  className,
}: DataGridProps<T>) {
  const [internalSortModel, setInternalSortModel] = useState<GridSortModel>([])
  const [internalQuickFilter, setInternalQuickFilter] = useState("")
  const [internalFilterModel, setInternalFilterModel] =
    useState<GridFilterModel>(DEFAULT_FILTER_MODEL)
  const [internalPagination, setInternalPagination] =
    useState<GridPaginationModel>(DEFAULT_PAGINATION)
  const [internalSelection, setInternalSelection] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const sortModel = sortModelProp ?? internalSortModel
  const quickFilterText = quickFilterTextProp ?? internalQuickFilter
  const filterModel = filterModelProp ?? internalFilterModel
  const paginationModel = paginationModelProp ?? internalPagination
  const rowSelectionModel = rowSelectionModelProp ?? internalSelection

  function setSortModel(next: GridSortModel) {
    if (sortModelProp === undefined) setInternalSortModel(next)
    onSortModelChange?.(next)
  }

  function setQuickFilterText(next: string) {
    if (quickFilterTextProp === undefined) setInternalQuickFilter(next)
    onQuickFilterTextChange?.(next)
    setPaginationModel({ ...paginationModel, page: 0 })
  }

  function setFilterModel(next: GridFilterModel) {
    if (filterModelProp === undefined) setInternalFilterModel(next)
    onFilterModelChange?.(next)
    setPaginationModel({ ...paginationModel, page: 0 })
  }

  function setPaginationModel(next: GridPaginationModel) {
    if (paginationModelProp === undefined) setInternalPagination(next)
    onPaginationModelChange?.(next)
  }

  function setRowSelectionModel(next: string[]) {
    if (rowSelectionModelProp === undefined) setInternalSelection(next)
    onRowSelectionModelChange?.(next)
  }

  function setColumnFilterValues(field: string, value: string[]) {
    const remaining = filterModel.items.filter((item) => item.field !== field)
    const nextItems =
      value.length === 0
        ? remaining
        : [...remaining, { field, operator: "isAnyOf" as const, value }]
    setFilterModel({ items: nextItems })
  }

  const detailEnabled = Boolean(getDetailPanelContent)
  const canExpandRow = (row: T) => {
    if (!detailEnabled) return false
    return getRowCanExpand ? getRowCanExpand(row) : true
  }

  let processed = rows
  if (filterMode === "client") {
    processed = applyQuickFilter(processed, columns, quickFilterText)
    processed = applyColumnFilters(processed, columns, filterModel)
  }
  if (sortingMode === "client") {
    processed = applySort(processed, columns, sortModel)
  }

  const totalRowCount =
    paginationMode === "server" ? (rowCountProp ?? rows.length) : processed.length

  const pageCount = Math.max(1, Math.ceil(totalRowCount / paginationModel.pageSize) || 1)
  const safePagination: GridPaginationModel = {
    ...paginationModel,
    page: Math.min(paginationModel.page, pageCount - 1),
  }

  const pageRows =
    paginationMode === "client"
      ? applyPagination(processed, safePagination)
      : processed

  const pageIds = pageRows.map((row) => getRowId(row))
  const selectedOnPage = pageIds.filter((id) => rowSelectionModel.includes(id))
  const allPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length
  const somePageSelected =
    selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length

  const selectedRows = rows.filter((row) =>
    rowSelectionModel.includes(getRowId(row))
  )

  const bulkContext: GridBulkActionContext<T> = {
    selectedIds: rowSelectionModel,
    selectedRows,
    clearSelection: () => setRowSelectionModel([]),
  }

  const showSelectionColumn =
    checkboxSelection || Boolean(bulkActions?.length) || Boolean(renderBulkActions)
  const showActionsColumn =
    Boolean(rowActions?.length) || Boolean(renderRowActions)
  const colSpan =
    columns.length +
    (showSelectionColumn ? 1 : 0) +
    (detailEnabled ? 1 : 0) +
    (showActionsColumn ? 1 : 0)

  function cycleSort(field: string, sortable: boolean) {
    if (!sortable) return
    const current = sortModel[0]
    if (!current || current.field !== field) {
      setSortModel([{ field, sort: "asc" }])
      return
    }
    if (current.sort === "asc") {
      setSortModel([{ field, sort: "desc" }])
      return
    }
    setSortModel([])
  }

  function toggleSelectAllPage(checked: boolean) {
    if (checked) {
      const merged = new Set([...rowSelectionModel, ...pageIds])
      setRowSelectionModel([...merged])
      return
    }
    const pageSet = new Set(pageIds)
    setRowSelectionModel(rowSelectionModel.filter((id) => !pageSet.has(id)))
  }

  function toggleSelectRow(id: string, checked: boolean) {
    if (checked) {
      if (rowSelectionModel.includes(id)) return
      setRowSelectionModel([...rowSelectionModel, id])
      return
    }
    setRowSelectionModel(rowSelectionModel.filter((selected) => selected !== id))
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      className={cn("flex w-full flex-col gap-3", className)}
      {...(direction ? { dir: direction } : {})}
    >
      <DataGridToolbar
        quickFilterText={quickFilterText}
        onQuickFilterTextChange={setQuickFilterText}
        bulkContext={bulkContext}
        bulkActions={bulkActions}
        renderBulkActions={renderBulkActions}
      />

      <div className="relative rounded-2xl border border-border">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              {detailEnabled ? (
                <TableHead className="w-10 text-start pe-0" />
              ) : null}
              {showSelectionColumn ? (
                <TableHead className="w-10 text-start pe-0">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={somePageSelected}
                    onCheckedChange={(checked) =>
                      toggleSelectAllPage(Boolean(checked))
                    }
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
              ) : null}
              {columns.map((column) => {
                const sortable = column.sortable !== false
                const showHeaderFilter =
                  Boolean(column.headerFilter) && column.filterable !== false
                const active = sortModel[0]?.field === column.field
                const sortDir = active ? sortModel[0]?.sort : undefined
                const selectedValues =
                  filterModel.items.find((item) => item.field === column.field)
                    ?.value ?? []
                const filterOptions = showHeaderFilter
                  ? getColumnFilterOptions(rows, column)
                  : []

                return (
                  <TableHead
                    key={column.field}
                    className="text-start"
                    style={{
                      width: column.width,
                      minWidth: column.minWidth ?? column.width,
                    }}
                    aria-sort={
                      sortDir === "asc"
                        ? "ascending"
                        : sortDir === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md text-start",
                          sortable &&
                            "cursor-pointer select-none hover:text-foreground"
                        )}
                        disabled={!sortable}
                        onClick={() => cycleSort(column.field, sortable)}
                      >
                        {column.headerName ?? column.field}
                        {sortable ? (
                          <HugeiconsIcon
                            icon={
                              sortDir === "asc"
                                ? ArrowUp01Icon
                                : sortDir === "desc"
                                  ? ArrowDown01Icon
                                  : ArrowUpDownIcon
                            }
                            strokeWidth={2}
                            className={cn(
                              "size-3.5",
                              sortDir
                                ? "text-foreground"
                                : "text-muted-foreground/70"
                            )}
                          />
                        ) : null}
                      </button>
                      {showHeaderFilter ? (
                        <DataGridColumnFilter
                          field={column.field}
                          label={column.headerName ?? column.field}
                          options={filterOptions}
                          selected={selectedValues}
                          onChange={(next) =>
                            setColumnFilterValues(column.field, next)
                          }
                        />
                      ) : null}
                    </div>
                  </TableHead>
                )
              })}
              {showActionsColumn ? (
                <TableHead
                  className="text-end"
                  style={{
                    width: rowActionsDisplay === "buttons" ? undefined : 56,
                    minWidth: rowActionsDisplay === "buttons" ? 120 : 56,
                  }}
                >
                  Actions
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => {
                const id = getRowId(row)
                const selected = rowSelectionModel.includes(id)
                const expandable = canExpandRow(row)
                const expanded = expandedIds.has(id)

                return (
                  <Fragment key={id}>
                    <TableRow data-state={selected ? "selected" : undefined}>
                      {detailEnabled ? (
                        <TableCell className="w-10 pe-0">
                          {expandable ? (
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              aria-label={expanded ? "Collapse row" : "Expand row"}
                              aria-expanded={expanded}
                              onClick={() => toggleExpanded(id)}
                            >
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                strokeWidth={2}
                                className={cn(
                                  "size-4 transition-transform",
                                  expanded ? "rotate-90" : "rtl:rotate-180"
                                )}
                              />
                            </Button>
                          ) : null}
                        </TableCell>
                      ) : null}
                      {showSelectionColumn ? (
                        <TableCell className="w-10 pe-0">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                              toggleSelectRow(id, Boolean(checked))
                            }
                            aria-label={`Select row ${id}`}
                          />
                        </TableCell>
                      ) : null}
                      {columns.map((column) => {
                        const value = getRowValue(row, column)
                        return (
                          <TableCell
                            key={column.field}
                            className="text-start"
                            style={{
                              width: column.width,
                              minWidth: column.minWidth ?? column.width,
                            }}
                          >
                            {column.renderCell
                              ? column.renderCell({
                                  row,
                                  field: column.field,
                                  value,
                                })
                              : value == null
                                ? ""
                                : String(value)}
                          </TableCell>
                        )
                      })}
                      {showActionsColumn ? (
                        <TableCell
                          className="text-end"
                          style={{
                            width: rowActionsDisplay === "buttons" ? undefined : 56,
                            minWidth: rowActionsDisplay === "buttons" ? 120 : 56,
                          }}
                        >
                          <DataGridRowActions
                            context={{ row, id }}
                            actions={rowActions ?? []}
                            display={rowActionsDisplay}
                            renderRowActions={renderRowActions}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>

                    {expanded && expandable && getDetailPanelContent ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={colSpan}
                          className="bg-muted/30 p-4 whitespace-normal"
                        >
                          {getDetailPanelContent({ row })}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataGridPagination
        paginationModel={safePagination}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={pageSizeOptions}
        rowCount={totalRowCount}
      />
    </div>
  )
}
