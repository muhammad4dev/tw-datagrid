import type { AppLocale } from "@/i18n/routing"
import messages from "../messages/en.json"

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale
    Messages: typeof messages
  }
}
