import {
  BookOpenIcon,
  BookSearch,
  BookText,
  BriefcaseMedicalIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageCircle,
  SettingsIcon,
  ShieldAlertIcon,
  StethoscopeIcon,
} from "lucide-react"

export const navigationGroups = [
  {
    label: "การจัดการ DRG",
    items: [
      { title: "ภาพรวมผู้ป่วยและความเสี่ยง", to: "/", icon: LayoutDashboardIcon },
      { title: "รายการผู้ป่วย DRG", to: "/worklist", icon: ClipboardListIcon, section: null },
      { title: "ตรวจสอบผู้ป่วย", to: "/case-review", icon: FileBarChartIcon },
      // { title: "EMR Case Viewer", to: "/emr-viewer", icon: StethoscopeIcon, badge: "Draft" },
      // { title: "Coding Review", to: "/coding-review", icon: BriefcaseMedicalIcon, badge: "Draft" },
      // { title: "Claim & Alerts", to: "/claim-alerts", icon: ShieldAlertIcon, badge: "12" },
    ],
  },
  {
    label: "ระบบแปลงเสียงเป็นข้อความ",
    items: [
      { title: "ภาพรวมบทสนทนา", to: "/dashboard-conversation", icon: LayoutDashboardIcon },
      // { title: "แปลงเสียงเป็นข้อความ", to: "/speech-to-text", icon: MessageCircle },
      // { title: "Result", to: "/result-page", icon: LayoutDashboardIcon },
    ],
  },
  {
    label: "ข้อมูลเชิงลึก",
    items: [
      { title: "รายได้และความเสี่ยง", to: "/revenue-risk", icon: CircleDollarSignIcon },
      // { title: "รายงาน", to: "/reports", icon: FileBarChartIcon },
    ],
  },
  {
    label: "การจัดการระบบ",
    isDividerBefore: true,
    items: [
      { title: "แบบประเมิน", to: "/assesment-page", icon: BookText },
      // { title: "คลังความรู้การให้รหัสโรค", to: "/coding-knowledge", icon: BookOpenIcon },
      { title: "ประวัติการใช้งาน", to: "/activity-history", icon: HistoryIcon },
      { title: "ตั้งค่า", icon: SettingsIcon },
    ],
  },
]

export const additionalRoutes = [
  {
    title: "แปลงเสียงเป็นข้อความ",
    to: "/speech-to-text",
    parent: "/dashboard-conversation",
    section: "ระบบแปลงเสียงเป็นข้อความ",
  },
  {
    title: "สรุปข้อมูล",
    to: "/result-page",
    parent: "/speech-to-text",
    section: "ระบบแปลงเสียงเป็นข้อความ",
  },
  // { title: "EMR Case Viewer", to: "/emr-viewer", section: "การจัดการ DRG" },
  // { title: "Coding Review", to: "/coding-review", section: "การจัดการ DRG" },
  // { title: "Claim & Alerts", to: "/claim-alerts", section: "การจัดการ DRG" },
]


export const breadcrumbByPath = (() => {
  const rawMap = {}

  navigationGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.to) {
        rawMap[item.to] = {
          title: item.title,
          to: item.to,
          section: item.section !== undefined ? item.section : group.label,
          parent: item.parent,
          parents: item.parents,
        }
      }
    })
  })

  additionalRoutes.forEach((item) => {
    if (item.to) {
      rawMap[item.to] = {
        title: item.title,
        to: item.to,
        section: item.section,
        parent: item.parent,
        parents: item.parents,
      }
    }
  })

  const finalMap = {}

  Object.entries(rawMap).forEach(([to, config]) => {
    let parents = []

    if (Array.isArray(config.parents)) {
      parents = [...config.parents]
    } else if (config.parent) {
      const visited = new Set([to])
      let currentParentPath = config.parent

      while (currentParentPath && rawMap[currentParentPath] && !visited.has(currentParentPath)) {
        visited.add(currentParentPath)
        const parentConfig = rawMap[currentParentPath]
        parents.unshift({
          title: parentConfig.title,
          to: parentConfig.to,
        })
        currentParentPath = parentConfig.parent
      }
    }

    finalMap[to] = {
      page: config.title,
      section: config.section,
      parents: parents,
    }
  })

  return finalMap
})()

/**
 * ฟังก์ชันดึงข้อมูล Breadcrumb ตาม path ปัจจุบัน
 */
export function getBreadcrumb(pathname) {
  return breadcrumbByPath[pathname] ?? breadcrumbByPath["/"] ?? { page: "หน้าหลัก", parents: [] }
}
