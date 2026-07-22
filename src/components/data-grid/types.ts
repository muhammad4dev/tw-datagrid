import type * as React from "react"

export type GridSortDirection = "asc" | "desc"

export type GridSortItem = {
  field: string
  sort: GridSortDirection
}

/** Single-column sort model (empty = unsorted). */
export type GridSortModel = GridSortItem[]

export type GridFilterItem = {
  field: string
  /** Multi-select equality for Role/Status-style columns */
  operator: "isAnyOf"
  value: string[]
}

export type GridFilterModel = {
  items: GridFilterItem[]
}

export type GridPaginationModel = {
  /** 0-based page index */
  page: number
  pageSize: number
}

export type GridRenderCellParams<T> = {
  row: T
  field: string
  value: unknown
}

export type GridColDef<T> = {
  field: string
  headerName?: string
  width?: number
  minWidth?: number
  type?: "string" | "singleSelect"
  sortable?: boolean
  filterable?: boolean
  /** Show multi-select filter control in the column header. */
  headerFilter?: boolean
  /** Explicit options for `singleSelect` / header filters; else derived from rows. */
  valueOptions?: string[]
  renderCell?: (params: GridRenderCellParams<T>) => React.ReactNode
  valueGetter?: (row: T) => unknown
}

export type GridBulkActionContext<T> = {
  selectedIds: string[]
  selectedRows: T[]
  clearSelection: () => void
}

export type GridBulkAction<T> = {
  id: string
  label: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  disabled?: boolean | ((ctx: GridBulkActionContext<T>) => boolean)
  onClick: (ctx: GridBulkActionContext<T>) => void
}

export type DataGridProps<T> = {
  rows: T[]
  columns: GridColDef<T>[]
  getRowId?: (row: T) => string

  /** Text direction. Default: inherit from nearest ancestor / document. */
  direction?: "ltr" | "rtl"

  sortingMode?: "client" | "server"
  filterMode?: "client" | "server"
  paginationMode?: "client" | "server"

  sortModel?: GridSortModel
  onSortModelChange?: (model: GridSortModel) => void
  quickFilterText?: string
  onQuickFilterTextChange?: (value: string) => void
  filterModel?: GridFilterModel
  onFilterModelChange?: (model: GridFilterModel) => void
  paginationModel?: GridPaginationModel
  onPaginationModelChange?: (model: GridPaginationModel) => void
  rowCount?: number
  pageSizeOptions?: number[]

  checkboxSelection?: boolean
  rowSelectionModel?: string[]
  onRowSelectionModelChange?: (ids: string[]) => void

  bulkActions?: GridBulkAction<T>[]
  renderBulkActions?: (ctx: GridBulkActionContext<T>) => React.ReactNode

  getDetailPanelContent?: (params: { row: T }) => React.ReactNode
  getRowCanExpand?: (row: T) => boolean

  loading?: boolean
  emptyMessage?: string
  className?: string
}
