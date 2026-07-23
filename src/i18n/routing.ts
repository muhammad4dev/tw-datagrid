import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
})

export type AppLocale = (typeof routing.locales)[number]
export type TextDirection = "ltr" | "rtl"

/** Locales that render right-to-left. Add new RTL langs here only. */
const RTL_LOCALES = new Set<AppLocale>(["ar"])

export function getDirection(locale: AppLocale): TextDirection {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr"
}

/** Cycle to the next configured locale (works for 2+ languages). */
export function getNextLocale(locale: AppLocale): AppLocale {
  const locales = routing.locales
  const index = locales.indexOf(locale)
  return locales[(index + 1) % locales.length]!
}
