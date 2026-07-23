# `DataGrid`

MUI-like data grid built on shadcn UI primitives. Supports typed columns, sorting, quick search, header multi-select filters, pagination, checkbox selection, bulk and row actions, expandable detail panels, and LTR/RTL. Implemented without `@tanstack/react-table`.

**Import**

```ts
import {
  DataGrid,
  type DataGridProps,
  type GridBulkAction,
  type GridColDef,
  type GridRowAction,
} from "@/components/data-grid"
```

Requires a Client Component (`"use client"`). Toolbar chrome strings use `next-intl` (`DataGrid` message namespace), so the tree must be under `NextIntlClientProvider`.

**Live demo:** [`src/app/[locale]/page.tsx`](../../app/[locale]/page.tsx) — Expandable vs Flat tabs, locale switcher, and API-backed users.

---

## Features

| Area | What you get |
| --- | --- |
| Columns | `field`, headers, widths, `valueGetter`, `renderCell`, `singleSelect` |
| Sort | Click header to cycle asc → desc → unsorted (single-column) |
| Quick filter | Toolbar search across stringified cell values |
| Header filters | Multi-select `isAnyOf` popover when `headerFilter` is set |
| Pagination | Page size select + range + prev/next |
| Selection | Checkbox column, select-all on page, bulk action bar |
| Row actions | Kebab menu (default) or inline buttons |
| Detail panels | Expandable rows via `getDetailPanelContent` |
| Direction | `direction="ltr" \| "rtl"` |
| Modes | Client (default) or server for sort / filter / pagination |

---

## Quick start

```tsx
"use client"

import { DataGrid, type GridColDef } from "@/components/data-grid"

type User = { id: string; name: string; email: string }

const columns: GridColDef<User>[] = [
  { field: "name", headerName: "Name", minWidth: 160 },
  { field: "email", headerName: "Email", minWidth: 200 },
]

const rows: User[] = [
  { id: "1", name: "Ada", email: "ada@example.com" },
]

export function UsersGrid() {
  return <DataGrid rows={rows} columns={columns} />
}
```

Rows must expose a stable `id` (string or number), or pass [`getRowId`](#datagridpropst).

---

## Columns (`GridColDef<T>`)

```ts
type GridColDef<T> = {
  field: string
  headerName?: string
  width?: number
  minWidth?: number
  type?: "string" | "singleSelect"
  sortable?: boolean
  filterable?: boolean
  headerFilter?: boolean
  valueOptions?: string[]
  renderCell?: (params: GridRenderCellParams<T>) => React.ReactNode
  valueGetter?: (row: T) => unknown
}
```

| Field | Default | Description |
| --- | --- | --- |
| `field` | — | Property key (or logical name when using `valueGetter`). |
| `headerName` | `field` | Column header label. |
| `width` / `minWidth` | — | Column sizing (CSS px). |
| `type` | `"string"` | Use `"singleSelect"` with `valueOptions` for enum-like columns. |
| `sortable` | `true` | Set `false` to disable header sort. |
| `filterable` | `true` | Set `false` to exclude from filters / header filter UI. |
| `headerFilter` | `false` | Shows a multi-select filter control in the header (`operator: "isAnyOf"`). |
| `valueOptions` | derived from rows | Explicit options for header filters / `singleSelect`. |
| `valueGetter` | row`[field]` | Compute the display/sort/filter value from the row. |
| `renderCell` | stringified value | Custom cell UI. Receives `{ row, field, value }`. |

### Example: computed column + custom cell

```tsx
const columns: GridColDef<User>[] = [
  {
    field: "orders",
    headerName: "Orders",
    width: 90,
    sortable: false,
    filterable: false,
    valueGetter: (row) => row.orders.length,
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    type: "singleSelect",
    headerFilter: true,
    valueOptions: ["active", "invited", "disabled"],
    renderCell: ({ value }) => (
      <span className="text-muted-foreground">{String(value)}</span>
    ),
  },
  {
    field: "total",
    headerName: "Total",
    width: 90,
    renderCell: ({ value }) => `$${value}`,
  },
]
```

Header filters always use multi-select equality (`isAnyOf`). Options come from `valueOptions` when set; otherwise unique values are collected from the current `rows`.

---

## Controlled vs uncontrolled

Sort, quick filter, column filters, pagination, and selection are **uncontrolled by default** (internal state). Pass the model prop **and** its change handler to take control.

| Concern | Uncontrolled | Controlled |
| --- | --- | --- |
| Sort | omit both | `sortModel` + `onSortModelChange` |
| Quick filter | omit both | `quickFilterText` + `onQuickFilterTextChange` |
| Column filters | omit both | `filterModel` + `onFilterModelChange` |
| Pagination | omit both | `paginationModel` + `onPaginationModelChange` |
| Selection | omit both | `rowSelectionModel` + `onRowSelectionModelChange` |

Changing quick filter or column filters resets page index to `0`.

### Controlled pagination

```tsx
const [paginationModel, setPaginationModel] = useState({
  page: 0,
  pageSize: 5,
})

<DataGrid
  rows={users}
  columns={columns}
  pageSizeOptions={[5, 10, 25]}
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
/>
```

Default internal pagination is `{ page: 0, pageSize: 10 }`. Default `pageSizeOptions` are `[10, 25, 50]`.

---

## Selection and actions

### Checkbox selection

```tsx
<DataGrid rows={rows} columns={columns} checkboxSelection />
```

Select-all applies to the **current page** only. Selected ids are strings from `getRowId`.

### Bulk actions

Shown in the toolbar when at least one row is selected.

```tsx
const bulkActions: GridBulkAction<User>[] = [
  {
    id: "export",
    label: "Export",
    variant: "outline",
    onClick: ({ selectedRows, clearSelection }) => {
      console.log(selectedRows)
      clearSelection()
    },
  },
  {
    id: "delete",
    label: "Delete",
    variant: "destructive",
    onClick: ({ selectedIds, clearSelection }) => {
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)))
      clearSelection()
    },
  },
]

<DataGrid
  rows={users}
  columns={columns}
  checkboxSelection
  bulkActions={bulkActions}
/>
```

`GridBulkActionContext`:

| Property | Description |
| --- | --- |
| `selectedIds` | Selected row id strings. |
| `selectedRows` | Matching row objects from `rows`. |
| `clearSelection` | Clears the selection model. |

Use `renderBulkActions` instead of (or in addition to wiring) `bulkActions` for fully custom toolbar UI. A default **Clear** button is included when using `bulkActions`.

### Row actions

```tsx
const rowActions: GridRowAction<User>[] = [
  {
    id: "edit",
    label: "Edit",
    onClick: ({ row }) => console.log("edit", row.id),
  },
  {
    id: "delete",
    label: "Delete",
    variant: "destructive",
    onClick: ({ row }) =>
      setUsers((prev) => prev.filter((u) => u.id !== row.id)),
  },
]

<DataGrid
  rows={users}
  columns={columns}
  rowActions={rowActions}
  rowActionsDisplay="menu" // default: kebab dropdown
  // rowActionsDisplay="buttons" // inline buttons instead
/>
```

`renderRowActions` replaces the built-in menu/buttons for a custom cell.

---

## Expandable rows

Pass `getDetailPanelContent` to enable a leading expand column. Optionally gate which rows can expand with `getRowCanExpand`.

```tsx
<DataGrid
  rows={users}
  columns={userColumns}
  getDetailPanelContent={({ row }) =>
    row.orders.length > 0 ? (
      <div className="space-y-2">
        <p className="text-sm font-medium">Orders for {row.name}</p>
        <DataGrid
          rows={row.orders}
          columns={orderColumns}
          pageSizeOptions={[5]}
        />
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">{row.notes}</p>
    )
  }
/>
```

Omit `getDetailPanelContent` for a flat grid (no expand column).

---

## Client vs server modes

| Prop | Default | `"client"` | `"server"` |
| --- | --- | --- | --- |
| `sortingMode` | `"client"` | Sorts `rows` in the grid | You sort; pass already-ordered `rows` |
| `filterMode` | `"client"` | Applies quick + column filters | You filter; pass filtered `rows` |
| `paginationMode` | `"client"` | Slices the processed list | You page; pass the current page’s `rows` and set `rowCount` |

### Server pagination sketch

```tsx
<DataGrid
  rows={pageRows}
  columns={columns}
  paginationMode="server"
  rowCount={totalCount}
  paginationModel={paginationModel}
  onPaginationModelChange={(model) => {
    setPaginationModel(model)
    // refetch page from API using model.page / model.pageSize
  }}
  sortingMode="server"
  sortModel={sortModel}
  onSortModelChange={setSortModel}
  filterMode="server"
  quickFilterText={query}
  onQuickFilterTextChange={setQuery}
/>
```

When `paginationMode` is `"server"`, `rowCount` defaults to `rows.length` if omitted — pass the full total from the API.

---

## RTL and i18n

| Concern | Who owns it |
| --- | --- |
| Layout direction | `direction="ltr" \| "rtl"` (or inherit from document / parent `dir`) |
| Chrome strings (Search, Rows per page, Clear, …) | `next-intl` namespace `DataGrid` in [`messages/en.json`](../../../messages/en.json) / [`messages/ar.json`](../../../messages/ar.json) |
| Column headers, action labels, empty copy | Caller (demo uses `Grid` / `Actions` / `Home` namespaces) |

```tsx
import { getDirection } from "@/i18n/routing"

const direction = getDirection(locale)

<DataGrid
  rows={users}
  columns={columns}
  direction={direction}
  emptyMessage={tGrid("emptyUsers")}
/>
```

---

## Loading and empty state

| Prop | Default | Description |
| --- | --- | --- |
| `loading` | `false` | Overlay with translated “Loading…” while true. |
| `emptyMessage` | `t("DataGrid.empty")` | Body message when the current page has no rows. |

---

## Fuller example (users grid)

```tsx
"use client"

import { useState } from "react"

import {
  DataGrid,
  type GridBulkAction,
  type GridColDef,
  type GridRowAction,
} from "@/components/data-grid"

type Order = { id: string; product: string; total: number }
type User = {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "invited" | "disabled"
  notes: string
  orders: Order[]
}

export function UsersDataGrid({
  users,
  onUsersChange,
  direction = "ltr",
  loading = false,
}: {
  users: User[]
  onUsersChange: (next: User[]) => void
  direction?: "ltr" | "rtl"
  loading?: boolean
}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  })

  const orderColumns: GridColDef<Order>[] = [
    { field: "id", headerName: "Order", width: 100 },
    { field: "product", headerName: "Product", minWidth: 140 },
    {
      field: "total",
      headerName: "Total",
      width: 90,
      renderCell: ({ value }) => `$${value}`,
    },
  ]

  const columns: GridColDef<User>[] = [
    { field: "name", headerName: "Name", minWidth: 160 },
    { field: "email", headerName: "Email", minWidth: 200 },
    {
      field: "role",
      headerName: "Role",
      width: 110,
      type: "singleSelect",
      headerFilter: true,
      valueOptions: ["Admin", "Editor", "Viewer"],
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      type: "singleSelect",
      headerFilter: true,
      valueOptions: ["active", "invited", "disabled"],
    },
    {
      field: "orders",
      headerName: "Orders",
      width: 90,
      sortable: false,
      filterable: false,
      valueGetter: (row) => row.orders.length,
    },
  ]

  const bulkActions: GridBulkAction<User>[] = [
    {
      id: "delete",
      label: "Delete",
      variant: "destructive",
      onClick: ({ selectedIds, clearSelection }) => {
        onUsersChange(users.filter((u) => !selectedIds.includes(u.id)))
        clearSelection()
      },
    },
  ]

  const rowActions: GridRowAction<User>[] = [
    {
      id: "delete",
      label: "Delete",
      variant: "destructive",
      onClick: ({ row }) =>
        onUsersChange(users.filter((u) => u.id !== row.id)),
    },
  ]

  return (
    <DataGrid
      rows={users}
      columns={columns}
      direction={direction}
      loading={loading}
      checkboxSelection
      bulkActions={bulkActions}
      rowActions={rowActions}
      pageSizeOptions={[5, 10, 25]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      getDetailPanelContent={({ row }) =>
        row.orders.length > 0 ? (
          <DataGrid
            rows={row.orders}
            columns={orderColumns}
            direction={direction}
            pageSizeOptions={[5]}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{row.notes}</p>
        )
      }
    />
  )
}
```

---

## `DataGridProps<T>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `T[]` | — | Row data. |
| `columns` | `GridColDef<T>[]` | — | Column definitions. |
| `getRowId` | `(row: T) => string` | reads `row.id` | Stable row id. Throws if `id` is missing. |
| `direction` | `"ltr" \| "rtl"` | inherit | Sets `dir` on the grid root. |
| `sortingMode` | `"client" \| "server"` | `"client"` | Where sorting runs. |
| `filterMode` | `"client" \| "server"` | `"client"` | Where quick + column filters run. |
| `paginationMode` | `"client" \| "server"` | `"client"` | Where paging runs. |
| `sortModel` | `GridSortModel` | internal `[]` | Controlled sort (single column or empty). |
| `onSortModelChange` | `(model) => void` | — | Sort change callback. |
| `quickFilterText` | `string` | internal `""` | Controlled quick search text. |
| `onQuickFilterTextChange` | `(value) => void` | — | Quick search change callback. |
| `filterModel` | `GridFilterModel` | internal `{ items: [] }` | Controlled column filters. |
| `onFilterModelChange` | `(model) => void` | — | Column filter change callback. |
| `paginationModel` | `GridPaginationModel` | `{ page: 0, pageSize: 10 }` | Controlled page index (0-based) and size. |
| `onPaginationModelChange` | `(model) => void` | — | Pagination change callback. |
| `rowCount` | `number` | see modes | Total rows when `paginationMode="server"`. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Page size select options. |
| `checkboxSelection` | `boolean` | `false` | Show selection checkboxes. |
| `rowSelectionModel` | `string[]` | internal `[]` | Controlled selected ids. |
| `onRowSelectionModelChange` | `(ids) => void` | — | Selection change callback. |
| `bulkActions` | `GridBulkAction<T>[]` | — | Toolbar actions when selection is non-empty. |
| `renderBulkActions` | `(ctx) => ReactNode` | — | Custom bulk action UI. |
| `rowActions` | `GridRowAction<T>[]` | — | Per-row actions. |
| `renderRowActions` | `(ctx) => ReactNode` | — | Custom row action UI. |
| `rowActionsDisplay` | `"menu" \| "buttons"` | `"menu"` | Kebab dropdown vs inline buttons. |
| `getDetailPanelContent` | `(params) => ReactNode` | — | Enables expandable detail panels. |
| `getRowCanExpand` | `(row) => boolean` | all expandable | Per-row expand gate. |
| `loading` | `boolean` | `false` | Loading overlay. |
| `emptyMessage` | `string` | translated empty | Empty-state message. |
| `className` | `string` | — | Root class name. |

---

## Related types

### Models

```ts
type GridSortModel = { field: string; sort: "asc" | "desc" }[]
// Empty array = unsorted. UI uses at most one active column.

type GridFilterItem = {
  field: string
  operator: "isAnyOf"
  value: string[]
}

type GridFilterModel = { items: GridFilterItem[] }

type GridPaginationModel = {
  page: number // 0-based
  pageSize: number
}
```

### Actions

```ts
type GridBulkAction<T> = {
  id: string
  label: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  disabled?: boolean | ((ctx: GridBulkActionContext<T>) => boolean)
  onClick: (ctx: GridBulkActionContext<T>) => void
}

type GridRowAction<T> = {
  id: string
  label: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  disabled?: boolean | ((ctx: GridRowActionContext<T>) => boolean)
  onClick: (ctx: GridRowActionContext<T>) => void
}
```

### Cell render params

```ts
type GridRenderCellParams<T> = {
  row: T
  field: string
  value: unknown
}
```

---

## Public exports

From `@/components/data-grid`:

| Export | Role |
| --- | --- |
| `DataGrid` | Main component |
| `DataGridToolbar` | Search + bulk bar (used internally) |
| `DataGridPagination` | Footer pagination (used internally) |
| `DataGridColumnFilter` | Header filter popover (used internally) |
| `DataGridRowActions` | Row action menu/buttons (used internally) |
| `defaultGetRowId` / `getRowValue` | Row id + cell value helpers |
| `applyQuickFilter` / `applyColumnFilters` / `applySort` / `applyPagination` / `getColumnFilterOptions` | Pipeline helpers (client mode) |
| Types listed in [`index.ts`](./index.ts) | Shared TypeScript types |

---

## Design constraints

- No `@tanstack/react-table` or MUI X Data Grid dependency.
- Single-column sort model in the UI (click header cycles).
- Header filters support `isAnyOf` only.
- Chrome copy is localized via next-intl; column and action labels are not auto-translated.
- Prefer client mode for in-memory datasets; use server modes when the API owns sort/filter/page.
