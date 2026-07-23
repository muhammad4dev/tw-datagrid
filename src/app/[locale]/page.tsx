"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import {
  DataGrid,
  type GridBulkAction,
  type GridColDef,
  type GridRowAction,
} from "@/components/data-grid"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFetch } from "@/hooks/use-fetch"
import { usePathname, useRouter } from "@/i18n/navigation"
import { getDirection, getNextLocale } from "@/i18n/routing"
import { ROLE_OPTIONS } from "@/lib/users-data"
import type { Order, User } from "@/types/user"

export default function HomePage() {
  const locale = useLocale()
  const t = useTranslations("Home")
  const tGrid = useTranslations("Grid")
  const tActions = useTranslations("Actions")
  const tStatus = useTranslations("Status")
  const router = useRouter()
  const pathname = usePathname()

  const direction = getDirection(locale)
  const nextLocale = getNextLocale(locale)

  const { data, error, isLoading } = useFetch<User[]>(
    `/api/users?locale=${locale}`
  )
  const [users, setUsers] = useState<User[]>([])
  const [lastAction, setLastAction] = useState(t("lastActionDefault"))
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  })

  const [prevData, setPrevData] = useState(data)
  if (data !== prevData) {
    setPrevData(data)
    if (data) setUsers(data)
  }

  const [prevLocale, setPrevLocale] = useState(locale)
  if (locale !== prevLocale) {
    setPrevLocale(locale)
    setLastAction(t("lastActionDefault"))
  }

  const orderColumns: GridColDef<Order>[] = [
    { field: "id", headerName: tGrid("orderId"), width: 100 },
    { field: "product", headerName: tGrid("product"), minWidth: 140 },
    {
      field: "total",
      headerName: tGrid("total"),
      width: 90,
      renderCell: ({ value }) => `$${value}`,
    },
  ]

  const userColumns: GridColDef<User>[] = [
    { field: "name", headerName: tGrid("name"), minWidth: 160 },
    { field: "email", headerName: tGrid("email"), minWidth: 200 },
    {
      field: "role",
      headerName: tGrid("role"),
      width: 110,
      type: "singleSelect",
      headerFilter: true,
      valueOptions: ROLE_OPTIONS[locale],
    },
    {
      field: "status",
      headerName: tGrid("status"),
      width: 120,
      type: "singleSelect",
      headerFilter: true,
      valueOptions: ["active", "invited", "disabled"],
      renderCell: ({ value }) => (
        <span className="text-muted-foreground">
          {tStatus(value as User["status"])}
        </span>
      ),
    },
    {
      field: "orders",
      headerName: tGrid("orders"),
      width: 90,
      sortable: false,
      filterable: false,
      valueGetter: (row) => row.orders.length,
    },
  ]

  const bulkActions: GridBulkAction<User>[] = [
    {
      id: "export",
      label: tActions("export"),
      variant: "outline",
      onClick: ({ selectedRows, clearSelection }) => {
        setLastAction(
          t("exportedUsers", {
            count: selectedRows.length,
            names: selectedRows
              .map((row) => row.name)
              .join(direction === "rtl" ? "، " : ", "),
          })
        )
        clearSelection()
      },
    },
    {
      id: "delete",
      label: tActions("delete"),
      variant: "destructive",
      onClick: ({ selectedIds, clearSelection }) => {
        setUsers((prev) => prev.filter((user) => !selectedIds.includes(user.id)))
        setLastAction(t("deletedUsers", { count: selectedIds.length }))
        clearSelection()
      },
    },
  ]

  const rowActions: GridRowAction<User>[] = [
    {
      id: "edit",
      label: tActions("edit"),
      onClick: ({ row }) => {
        setLastAction(t("editedUser", { name: row.name }))
      },
    },
    {
      id: "delete",
      label: tActions("delete"),
      variant: "destructive",
      onClick: ({ row }) => {
        setUsers((prev) => prev.filter((user) => user.id !== row.id))
        setLastAction(t("deletedUser", { name: row.name }))
      },
    },
  ]

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace(pathname, { locale: nextLocale })}
          >
            {t("localeSwitch", { locale: nextLocale.toUpperCase() })}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">{lastAction}</p>

        {error ? (
          <p className="text-sm text-destructive">
            {t("loadError", { message: error.message })}
          </p>
        ) : null}

        <Tabs defaultValue="expandable" className="gap-4">
          <TabsList>
            <TabsTrigger value="expandable">{t("tabExpandable")}</TabsTrigger>
            <TabsTrigger value="flat">{t("tabFlat")}</TabsTrigger>
          </TabsList>

          <TabsContent value="expandable" className="outline-none">
            <DataGrid
              rows={users}
              columns={userColumns}
              direction={direction}
              loading={isLoading}
              emptyMessage={tGrid("emptyUsers")}
              checkboxSelection
              bulkActions={bulkActions}
              rowActions={rowActions}
              pageSizeOptions={[5, 10, 25]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              getDetailPanelContent={({ row }) =>
                row.orders.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {tGrid("ordersFor", { name: row.name })}
                    </p>
                    <DataGrid
                      rows={row.orders}
                      columns={orderColumns}
                      direction={direction}
                      pageSizeOptions={[5]}
                      emptyMessage={tGrid("noOrders")}
                    />
                  </div>
                ) : (
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {row.notes}
                  </p>
                )
              }
            />
          </TabsContent>

          <TabsContent value="flat" className="outline-none">
            <DataGrid
              rows={users}
              columns={userColumns}
              direction={direction}
              loading={isLoading}
              emptyMessage={tGrid("emptyUsers")}
              checkboxSelection
              bulkActions={bulkActions}
              rowActions={rowActions}
              pageSizeOptions={[5, 10, 25]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
