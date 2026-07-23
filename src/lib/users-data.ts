import type { Locale, User } from "@/types/user"

const USERS_EN: User[] = [
  {
    id: "1",
    name: "Amina Hassan",
    email: "amina@example.com",
    role: "Admin",
    status: "active",
    notes:
      "Primary account owner for the Middle East region. Prefers Arabic UI and weekly digest emails.",
    orders: [
      { id: "o-101", product: "Pro Plan", total: 49 },
      { id: "o-102", product: "Seat Add-on", total: 12 },
    ],
  },
  {
    id: "2",
    name: "Noah Cohen",
    email: "noah@example.com",
    role: "Editor",
    status: "active",
    notes: "Works across design and content. No outstanding invoices.",
    orders: [{ id: "o-201", product: "Starter Plan", total: 19 }],
  },
  {
    id: "3",
    name: "Sofia Alvarez",
    email: "sofia@example.com",
    role: "Viewer",
    status: "invited",
    notes: "Invitation sent on Monday. Waiting for SSO confirmation.",
    orders: [],
  },
  {
    id: "4",
    name: "James Okonkwo",
    email: "james@example.com",
    role: "Editor",
    status: "active",
    notes: "Handles partner onboarding checklists and quarterly reviews.",
    orders: [
      { id: "o-401", product: "Pro Plan", total: 49 },
      { id: "o-402", product: "Storage Pack", total: 8 },
      { id: "o-403", product: "Support Plus", total: 25 },
    ],
  },
  {
    id: "5",
    name: "Layla Mansour",
    email: "layla@example.com",
    role: "Admin",
    status: "disabled",
    notes: "Account paused at customer request until next quarter.",
    orders: [],
  },
  {
    id: "6",
    name: "Ethan Brooks",
    email: "ethan@example.com",
    role: "Viewer",
    status: "active",
    notes: "Read-only access for finance reporting.",
    orders: [{ id: "o-601", product: "Starter Plan", total: 19 }],
  },
  {
    id: "7",
    name: "Mia Chen",
    email: "mia@example.com",
    role: "Editor",
    status: "invited",
    notes: "Needs workspace access before the launch checklist is shared.",
    orders: [],
  },
  {
    id: "8",
    name: "Omar Farouk",
    email: "omar@example.com",
    role: "Viewer",
    status: "active",
    notes: "Regional analyst. Detail panel shows a nested orders grid.",
    orders: [
      { id: "o-801", product: "Enterprise", total: 199 },
      { id: "o-802", product: "Audit Pack", total: 40 },
    ],
  },
  {
    id: "9",
    name: "Hannah Lee",
    email: "hannah@example.com",
    role: "Editor",
    status: "active",
    notes: "Coordinates release notes and changelog publishing.",
    orders: [{ id: "o-901", product: "Pro Plan", total: 49 }],
  },
  {
    id: "10",
    name: "Youssef Nader",
    email: "youssef@example.com",
    role: "Admin",
    status: "active",
    notes: "Owns billing alerts and seat reconciliation.",
    orders: [
      { id: "o-1001", product: "Enterprise", total: 199 },
      { id: "o-1002", product: "Seat Add-on", total: 12 },
    ],
  },
  {
    id: "11",
    name: "Priya Shah",
    email: "priya@example.com",
    role: "Viewer",
    status: "disabled",
    notes: "Access revoked after project handoff.",
    orders: [],
  },
  {
    id: "12",
    name: "Lucas Meyer",
    email: "lucas@example.com",
    role: "Editor",
    status: "active",
    notes: "Works on localization copy and RTL QA.",
    orders: [{ id: "o-1201", product: "Pro Plan", total: 49 }],
  },
]

const USERS_AR: User[] = [
  {
    id: "1",
    name: "أمينة حسن",
    email: "amina@example.com",
    role: "مدير",
    status: "active",
    notes:
      "مالكة الحساب الرئيسية لمنطقة الشرق الأوسط. تفضّل واجهة عربية ورسائل أسبوعية مختصرة.",
    orders: [
      { id: "o-101", product: "الخطة الاحترافية", total: 49 },
      { id: "o-102", product: "إضافة مقعد", total: 12 },
    ],
  },
  {
    id: "2",
    name: "نوح كوهين",
    email: "noah@example.com",
    role: "محرر",
    status: "active",
    notes: "يعمل على التصميم والمحتوى. لا توجد فواتير مستحقة.",
    orders: [{ id: "o-201", product: "الخطة الأساسية", total: 19 }],
  },
  {
    id: "3",
    name: "صوفيا ألفاريز",
    email: "sofia@example.com",
    role: "مشاهد",
    status: "invited",
    notes: "أُرسلت الدعوة يوم الاثنين. بانتظار تأكيد تسجيل الدخول الموحّد.",
    orders: [],
  },
  {
    id: "4",
    name: "جيمس أوكونكو",
    email: "james@example.com",
    role: "محرر",
    status: "active",
    notes: "يتولى قوائم تأهيل الشركاء والمراجعات الفصلية.",
    orders: [
      { id: "o-401", product: "الخطة الاحترافية", total: 49 },
      { id: "o-402", product: "حزمة التخزين", total: 8 },
      { id: "o-403", product: "الدعم بلس", total: 25 },
    ],
  },
  {
    id: "5",
    name: "ليلى منصور",
    email: "layla@example.com",
    role: "مدير",
    status: "disabled",
    notes: "الحساب متوقف بطلب العميل حتى الربع القادم.",
    orders: [],
  },
  {
    id: "6",
    name: "إيثان بروكس",
    email: "ethan@example.com",
    role: "مشاهد",
    status: "active",
    notes: "وصول للقراءة فقط لتقارير المالية.",
    orders: [{ id: "o-601", product: "الخطة الأساسية", total: 19 }],
  },
  {
    id: "7",
    name: "ميا تشين",
    email: "mia@example.com",
    role: "محرر",
    status: "invited",
    notes: "تحتاج صلاحية مساحة العمل قبل مشاركة قائمة الإطلاق.",
    orders: [],
  },
  {
    id: "8",
    name: "عمر فاروق",
    email: "omar@example.com",
    role: "مشاهد",
    status: "active",
    notes: "محلل إقليمي. لوحة التفاصيل تعرض شبكة طلبات متداخلة.",
    orders: [
      { id: "o-801", product: "المؤسسات", total: 199 },
      { id: "o-802", product: "حزمة التدقيق", total: 40 },
    ],
  },
  {
    id: "9",
    name: "هانا لي",
    email: "hannah@example.com",
    role: "محرر",
    status: "active",
    notes: "تنسّق ملاحظات الإصدار ونشر سجل التغييرات.",
    orders: [{ id: "o-901", product: "الخطة الاحترافية", total: 49 }],
  },
  {
    id: "10",
    name: "يوسف نادر",
    email: "youssef@example.com",
    role: "مدير",
    status: "active",
    notes: "مسؤول عن تنبيهات الفوترة ومطابقة المقاعد.",
    orders: [
      { id: "o-1001", product: "المؤسسات", total: 199 },
      { id: "o-1002", product: "إضافة مقعد", total: 12 },
    ],
  },
  {
    id: "11",
    name: "بريا شاه",
    email: "priya@example.com",
    role: "مشاهد",
    status: "disabled",
    notes: "أُلغي الوصول بعد تسليم المشروع.",
    orders: [],
  },
  {
    id: "12",
    name: "لوكاس ماير",
    email: "lucas@example.com",
    role: "محرر",
    status: "active",
    notes: "يعمل على نصوص الترجمة واختبار واجهة من اليمين لليسار.",
    orders: [{ id: "o-1201", product: "الخطة الاحترافية", total: 49 }],
  },
]

export function parseLocale(value: string | null | undefined): Locale {
  return value === "ar" ? "ar" : "en"
}

export function getUsers(locale: Locale): User[] {
  const source = locale === "ar" ? USERS_AR : USERS_EN
  return source.map((user) => ({
    ...user,
    orders: user.orders.map((order) => ({ ...order })),
  }))
}

export const ROLE_OPTIONS: Record<Locale, string[]> = {
  en: ["Admin", "Editor", "Viewer"],
  ar: ["مدير", "محرر", "مشاهد"],
}
