"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { FilterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type DataGridColumnFilterProps = {
  field: string
  label: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}

export function DataGridColumnFilter({
  field,
  label,
  options,
  selected,
  onChange,
}: DataGridColumnFilterProps) {
  const activeCount = selected.length

  function toggleOption(option: string, checked: boolean) {
    if (checked) {
      if (selected.includes(option)) return
      onChange([...selected, option])
      return
    }
    onChange(selected.filter((value) => value !== option))
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "relative shrink-0",
          activeCount > 0 && "text-foreground"
        )}
        aria-label={`Filter ${label}`}
        onClick={(event) => event.stopPropagation()}
      >
        <HugeiconsIcon
          icon={FilterIcon}
          strokeWidth={2}
          className={cn(
            "size-3.5",
            activeCount > 0 ? "text-foreground" : "text-muted-foreground/70"
          )}
        />
        {activeCount > 0 ? (
          <span className="absolute -top-0.5 -end-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-56 gap-3 p-3"
        onClick={(event) => event.stopPropagation()}
      >
        <PopoverHeader className="gap-0">
          <PopoverTitle className="text-sm">Filter {label}</PopoverTitle>
        </PopoverHeader>

        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options</p>
          ) : (
            options.map((option) => {
              const checked = selected.includes(option)
              const id = `filter-${field}-${option}`
              return (
                <label
                  key={option}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(next) =>
                      toggleOption(option, Boolean(next))
                    }
                  />
                  <span className="capitalize">{option}</span>
                </label>
              )
            })
          )}
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="self-start"
          disabled={activeCount === 0}
          onClick={() => onChange([])}
        >
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  )
}
