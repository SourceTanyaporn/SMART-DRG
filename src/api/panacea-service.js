import { panaceaClient } from "@/api/create-api";
import { drgWorklistData } from "@/features/drg-worklist/data";
import dayjs from "@/lib/dayjs";

/**
 * Service สำหรับดึงข้อมูลเวชระเบียนและ Dashboard ผ่าน panaceaClient
 */
export const PanaceaService = {
  /**
   * ดึงข้อมูลสรุป Dashboard (Stats, Worklist, Risk, Revenue)
   */
  getDashboardData: async (params = {}) => {
    const { startDate, endDate } = params;

    try {
      // พยายามยิงดึงข้อมูลจาก Panacea API ผ่าน panaceaClient
      const response = await panaceaClient.get("/api/SmartDrg/dashboard", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      const data = response.data?.responseData || response.data?.data || response.data;

      if (data && (data.cases || data.summary || Array.isArray(data))) {
        const cases = Array.isArray(data) ? data : data.cases || [];
        return {
          isLive: true,
          error: null,
          cases,
          summary: data.summary || calculateSummary(cases),
          riskDistribution: data.riskDistribution || calculateRiskDistribution(cases),
          revenueTrend: data.revenueTrend || calculateRevenueTrend(cases),
        };
      }
    } catch (err) {
      console.warn(
        "Panacea API (/api/SmartDrg/dashboard) unavailable, falling back to local dataset:",
        err.message
      );
    }

    // Fallback: กรองข้อมูลจากชุดข้อมูลเวชระเบียนตามช่วงวันที่
    const filteredCases = drgWorklistData.filter((item) => {
      if (startDate && item.date && item.date < startDate) return false;
      if (endDate && item.date && item.date > endDate) return false;
      return true;
    });

    return {
      isLive: false,
      error: "Panacea API offline - แสดงข้อมูลจำลองสำหรับโหมดพัฒนา",
      cases: filteredCases,
      summary: calculateSummary(filteredCases),
      riskDistribution: calculateRiskDistribution(filteredCases),
      revenueTrend: calculateRevenueTrend(filteredCases),
    };
  },

  /**
   * ดึงรายการผู้ป่วย DRG Worklist ผ่าน panaceaClient
   */
  getDrgWorklist: async (params = {}) => {
    const { startDate, endDate, patientType, hn, an, status } = params;

    try {
      const response = await panaceaClient.get("/api/SmartDrg/worklist", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          patientType: patientType || undefined,
          hn: hn || undefined,
          an: an || undefined,
          status: status || undefined,
        },
      });

      const list = response.data?.responseData || response.data?.data || response.data;
      if (Array.isArray(list)) {
        return { isLive: true, data: list, error: null };
      }
    } catch (err) {
      console.warn("Panacea API (/api/SmartDrg/worklist) unavailable:", err.message);
    }

    // Fallback
    const filtered = drgWorklistData.filter((item) => {
      if (startDate && item.date && item.date < startDate) return false;
      if (endDate && item.date && item.date > endDate) return false;
      if (patientType) {
        const isIpd = Boolean(item.an && String(item.an).trim() !== "" && item.an !== "-");
        if (patientType === "IPD" && !isIpd) return false;
        if (patientType === "OPD" && isIpd) return false;
      }
      if (hn && (!item.hn || !item.hn.toLowerCase().includes(hn.toLowerCase()))) return false;
      if (an) {
        const matchAn = item.an && item.an.toLowerCase().includes(an.toLowerCase());
        const matchVn = item.vn && item.vn.toLowerCase().includes(an.toLowerCase());
        if (!matchAn && !matchVn) return false;
      }
      if (status && item.status !== status) return false;
      return true;
    });

    return { isLive: false, data: filtered, error: null };
  },

  /**
   * ดึงรายละเอียดเคสผู้ป่วยตาม AN ผ่าน panaceaClient
   */
  getCaseDetail: async (an) => {
    try {
      const response = await panaceaClient.get(`/api/SmartDrg/cases/${an}`);
      const data = response.data?.responseData || response.data?.data || response.data;
      if (data) {
        return { isLive: true, data, error: null };
      }
    } catch (err) {
      console.warn(`Panacea API (/api/SmartDrg/cases/${an}) unavailable:`, err.message);
    }

    const localCase = drgWorklistData.find((c) => c.an === an) || null;
    return { isLive: false, data: localCase, error: null };
  },
};

/**
 * Helper: คำนวณค่าสถิติจากรายการเคส
 */
function calculateSummary(cases) {
  const totalCasesCount = cases.length;
  const highRiskCount = cases.filter((c) => c.risk === "สูง").length;
  const totalAdjrw = cases.reduce((sum, c) => sum + (c.adjrw || 0), 0);
  const totalCost = cases.reduce((sum, c) => sum + (c.cost || 0), 0);
  const estimatedLoss = Math.round(totalCost * 0.16);

  return {
    totalCasesCount,
    highRiskCount,
    totalAdjrw: Number(totalAdjrw.toFixed(2)),
    avgAdjrw: totalCasesCount > 0 ? Number((totalAdjrw / totalCasesCount).toFixed(2)) : 0,
    totalCost,
    estimatedLoss,
  };
}

/**
 * Helper: คำนวณการกระจายความเสี่ยงสำหรับ Recharts
 */
function calculateRiskDistribution(cases) {
  const high = cases.filter((c) => c.risk === "สูง").length;
  const medium = cases.filter((c) => c.risk === "ปานกลาง").length;
  const low = cases.filter((c) => c.risk === "ต่ำ").length;

  return [
    { name: "สูง", value: high, fill: "#ef476f" },
    { name: "ปานกลาง", value: medium, fill: "#f5ae21" },
    { name: "ต่ำ", value: low, fill: "#20b486" },
  ];
}

/**
 * Helper: สร้างแนวโน้มรายได้สำหรับ Recharts
 */
function calculateRevenueTrend(cases) {
  // สร้างกราฟแบ่งตามวันย้อนหลังหรือวันที่ในเคส
  const groupsByDate = {};
  cases.forEach((c) => {
    const d = c.date ? dayjs(c.date).format("D MMM") : "อื่นๆ";
    if (!groupsByDate[d]) {
      groupsByDate[d] = { expected: 0, actual: 0 };
    }
    const cost = c.cost || 100000;
    groupsByDate[d].expected += cost;
    groupsByDate[d].actual += Math.round(cost * (c.risk === "สูง" ? 0.65 : 0.85));
  });

  const entries = Object.entries(groupsByDate);
  if (entries.length >= 3) {
    return entries.map(([date, val]) => ({
      date,
      expected: val.expected,
      actual: val.actual,
    }));
  }

  // ค่ามาตรฐานถ้าข้อมูลน้อย
  return [
    { date: "14 พ.ค.", expected: 520000, actual: 260000 },
    { date: "15 พ.ค.", expected: 840000, actual: 580000 },
    { date: "16 พ.ค.", expected: 940000, actual: 690000 },
    { date: "17 พ.ค.", expected: 1380000, actual: 910000 },
    { date: "18 พ.ค.", expected: 1640000, actual: 1080000 },
    { date: "19 พ.ค.", expected: 1860000, actual: 1210000 },
    { date: "20 พ.ค.", expected: 2050000, actual: 1390000 },
  ];
}
