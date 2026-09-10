import {
  BookOpenIcon,
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

/**
 * โครงสร้างเมนูนำทางหลักของระบบ (Single Source of Truth)
 * ใช้ร่วมกันระหว่าง AppSidebar และ Breadcrumb ใน __root.jsx
 */
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
      { title: "คลังความรู้การให้รหัสโรค", icon: BookOpenIcon },
      { title: "ประวัติการใช้งาน", icon: HistoryIcon },
      { title: "ตั้งค่า", icon: SettingsIcon },
    ],
  },
]

/**
 * เส้นทางเพิ่มเติมที่ไม่ได้อยู่ในเมนูหลักของ Sidebar แต่เชื่อมโยงเป็นลำดับขั้น (Hierarchical Flow)
 * - กำหนด parent: เพื่อระบุหน้าที่กดเชื่อมโยงมา ระบบจะสร้าง Breadcrumb ย้อนหลังให้คลิกกลับได้อัตโนมัติ
 * - กำหนด section: หากต้องการให้แสดงชื่อหมวดหมู่นำหน้า
 */
export const additionalRoutes = [
  {
    title: "แปลงเสียงเป็นข้อความ",
    to: "/speech-to-text",
    parent: "/dashboard-conversation", // กดมาจาก หน้าภาพรวมบทสนทนา
    section: "ระบบแปลงเสียงเป็นข้อความ",
  },
  {
    title: "สรุปข้อมูล",
    to: "/result-page",
    parent: "/speech-to-text", // กดมาจาก หน้าแปลงเสียงเป็นข้อความ
    section: "ระบบแปลงเสียงเป็นข้อความ",
  },
  // { title: "EMR Case Viewer", to: "/emr-viewer", section: "การจัดการ DRG" },
  // { title: "Coding Review", to: "/coding-review", section: "การจัดการ DRG" },
  // { title: "Claim & Alerts", to: "/claim-alerts", section: "การจัดการ DRG" },
]

/**
 * สร้าง breadcrumbByPath อัตโนมัติพร้อม Parent Trail ลำดับขั้น
 */
export const breadcrumbByPath = (() => {
  const rawMap = {}

  // 1. นำข้อมูลจาก navigationGroups เข้าสู่ rawMap
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

  // 2. นำข้อมูลจาก additionalRoutes เข้าสู่ rawMap
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

  // 3. คำนวณ Parents Chain อัตโนมัติ (เช่น /result-page -> /speech-to-text -> /dashboard-conversation)
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
