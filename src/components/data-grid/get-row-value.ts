import type { GridColDef } from "./types"

export function getRowValue<T>(row: T, column: GridColDef<T>): unknown {
  if (column.valueGetter) {
    return column.valueGetter(row)
  }
  return (row as Record<string, unknown>)[column.field]
}

export function defaultGetRowId<T>(row: T): string {
  const id = (row as { id?: unknown }).id
  if (id == null) {
    throw new Error(
      "DataGrid: row is missing an `id`. Pass getRowId to provide a stable row id."
    )
  }
  return String(id)
}
