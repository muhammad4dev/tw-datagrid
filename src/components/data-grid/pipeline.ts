import { getRowValue } from "./get-row-value"
import type {
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "./types"

function stringifyValue(value: unknown): string {
  if (value == null) return ""
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function applyQuickFilter<T>(
  rows: T[],
  columns: GridColDef<T>[],
  quickFilterText: string
): T[] {
  const query = quickFilterText.trim().toLowerCase()
  if (!query) return rows

  const filterable = columns.filter((col) => col.filterable !== false)

  return rows.filter((row) =>
    filterable.some((col) =>
      stringifyValue(getRowValue(row, col)).toLowerCase().includes(query)
    )
  )
}

export function applyColumnFilters<T>(
  rows: T[],
  columns: GridColDef<T>[],
  filterModel: GridFilterModel
): T[] {
  const activeItems = filterModel.items.filter(
    (item) => item.operator === "isAnyOf" && item.value.length > 0
  )
  if (activeItems.length === 0) return rows

  return rows.filter((row) =>
    activeItems.every((item) => {
      const column = columns.find((col) => col.field === item.field)
      if (!column || column.filterable === false) return true
      const cell = stringifyValue(getRowValue(row, column))
      return item.value.includes(cell)
    })
  )
}

export function getColumnFilterOptions<T>(
  rows: T[],
  column: GridColDef<T>
): string[] {
  if (column.valueOptions?.length) {
    return [...column.valueOptions]
  }

  const unique = new Set<string>()
  for (const row of rows) {
    const value = stringifyValue(getRowValue(row, column))
    if (value) unique.add(value)
  }
  return [...unique].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  )
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === "number" && typeof b === "number") {
    return a - b
  }

  const aTime =
    a instanceof Date
      ? a.getTime()
      : typeof a === "string" && !Number.isNaN(Date.parse(a)) && /^\d{4}-\d{2}/.test(a)
        ? Date.parse(a)
        : null
  const bTime =
    b instanceof Date
      ? b.getTime()
      : typeof b === "string" && !Number.isNaN(Date.parse(b)) && /^\d{4}-\d{2}/.test(b)
        ? Date.parse(b)
        : null

  if (aTime != null && bTime != null) {
    return aTime - bTime
  }

  return stringifyValue(a).localeCompare(stringifyValue(b), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

export function applySort<T>(
  rows: T[],
  columns: GridColDef<T>[],
  sortModel: GridSortModel
): T[] {
  const item = sortModel[0]
  if (!item) return rows

  const column = columns.find((col) => col.field === item.field)
  if (!column || column.sortable === false) return rows

  const direction = item.sort === "desc" ? -1 : 1
  return [...rows].sort((rowA, rowB) => {
    const a = getRowValue(rowA, column)
    const b = getRowValue(rowB, column)
    return compareValues(a, b) * direction
  })
}

export function applyPagination<T>(
  rows: T[],
  paginationModel: GridPaginationModel
): T[] {
  const { page, pageSize } = paginationModel
  const start = page * pageSize
  return rows.slice(start, start + pageSize)
}
