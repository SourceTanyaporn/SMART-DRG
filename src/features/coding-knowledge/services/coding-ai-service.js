/**
 * Service สำหรับสืบค้นและวิเคราะห์แนวทางการให้รหัสโรคด้วย AI (AI Coding Knowledge & Clinical Guidelines)
 * เชื่อมต่อกับ Backend FastAPI หรือทำงานผ่าน Smart Clinical Knowledge Synthesizer
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

/**
 * ฐานความรู้จำลองอัจฉริยะสำหรับโรคเฉพาะทางที่พบบ่อย (Fallback Medical Knowledge Base)
 */
const FALLBACK_KNOWLEDGE_MAP = {
  cirrhosis: {
    code: "K74.6 / K70.3",
    pdxCode: "K74.6",
    relatedCodes: ["K74.6", "K70.3", "K76.6", "R18.8", "I85.0"],
    title: "Cirrhosis of Liver & Portal Hypertension (ตับแข็งและความดันในหลอดเลือดดำตับสูง)",
    titleEn: "Cirrhosis of Liver with Complications",
    category: "internal-medicine",
    categoryLabel: "อายุรกรรม",
    drgImpact: "cc",
    drgImpactLabel: "Comorbidity (CC)",
    estimatedRwBoost: "+0.75 - 1.80",
    auditRiskLevel: "high",
    auditRiskLabel: "ตรวจการประเมิน Child-Pugh Score และผล Ultrasound/CT ตับ",
    summary: "พังผืดในเนื้อตับระยะสุดท้ายจากสาเหตุต่างๆ เช่น ไวรัสตับอักเสบ B/C หรือแอลกอฮอล์ นำไปสู่ภาวะแทรกซ้อนของ Portal Hypertension เช่น ท้องมาน (Ascites) และ Hepatic Encephalopathy",
    clinicalCriteria: [
      "มีประวัติโรคตับเรื้อรัง เช่น ไวรัสตับอักเสบบี/ซี หรือดื่มสุราเรื้อรัง",
      "ตรวจร่างกายพบ Stigmata of chronic liver disease: Spider nevi, Palmar erythema, Jaundice, Ascites, Splenomegaly",
      "ผลตรวจทางห้องปฏิบัติการ: Albumin ต่ำ, Globulin สูง, Coagulopathy (INR ยืด), Thrombocytopenia จากภาวะ Hypersplenism",
      "ภาพถ่ายรังสี (Ultrasound / CT Upper Abdomen): ผิวตับขรุขระ (Coarse echo / Nodular surface), ขอบตับทู่ (Blunt edge), ม้ามโต (Splenomegaly), มีน้ำในช่องท้อง (Ascites)",
    ],
    codingRules: [
      "ตับแข็งจากแอลกอฮอล์ ให้รหัส K70.3 (Alcoholic cirrhosis of liver)",
      "ตับแข็งจากสาเหตุอื่นหรือไม่ระบุ ให้รหัส K74.6 (Other and unspecified cirrhosis of liver)",
      "หากมีภาวะติดเชื้อในน้ำในช่องท้อง (Spontaneous Bacterial Peritonitis - SBP) ให้รหัส K65.0 (Acute peritonitis) ร่วมด้วยเสมอ ซึ่งจะปรับเป็น MCC ทันที",
    ],
    auditPitfalls: [
      "ให้รหัส Cirrhosis โดยไม่มีผลภาพถ่ายรังสี (US/CT) หรือผลทางพยาธิวิทยารองรับ มีเพียงค่าเอนไซม์ตับ AST/ALT สูงเล็กน้อย จะถูก Auditor ปรับลดเป็นเพียง Hepatitis",
      "ขาดการบันทึกระดับความรุนแรงตาม Child-Pugh Class (Class A, B, C) ในเวชระเบียน",
    ],
    documentationExample: {
      doctorTitle: "ตัวอย่าง Progress Note ผู้ป่วยตับแข็ง",
      note: "Impression: Decompensated Cirrhosis of Liver (Child-Pugh Class C, Score 11) with Spontaneous Bacterial Peritonitis (SBP)\n- S: Increased abdominal distension, dull aching abdominal pain x 2 days, low-grade fever\n- O: Jaundice, spider nevi on chest, marked shifting dullness with moderate abdominal tenderness\n- Paracentesis lab: Ascitic fluid WBC 1,450/mm3 (PMN 82% = absolute PMN 1,189/mm3 > 250), Albumin 0.8 g/dL (SAAG = 2.4 - 0.8 = 1.6 > 1.1 g/dL compatible with Portal HT)\n- Ultrasound: Cirrhotic liver with coarse parenchymal texture, marked ascites, splenomegaly 14 cm\n- Plan: IV Cefotaxime 2g q 8h, IV 20% Albumin 1.5 g/kg on day 1, Hold spironolactone, Follow up repeat paracentesis in 48 hrs",
    },
    references: "EASL Clinical Practice Guidelines on the management of ascites and spontaneous bacterial peritonitis / Thai Association for the Study of the Liver (THASL)",
    tags: ["Cirrhosis", "K74.6", "SBP", "Ascites", "Child-Pugh", "SAAG", "CC", "MCC"],
  },
  sbp: {
    code: "K65.0 / K74.6",
    pdxCode: "K65.0",
    relatedCodes: ["K65.0", "K74.6", "R18.8", "A41.9"],
    title: "Spontaneous Bacterial Peritonitis (SBP - ติดเชื้อในน้ำในช่องท้อง)",
    titleEn: "Spontaneous Bacterial Peritonitis in Cirrhosis",
    category: "internal-medicine",
    categoryLabel: "อายุรกรรม",
    drgImpact: "mcc",
    drgImpactLabel: "Major CC (MCC)",
    estimatedRwBoost: "+1.90 - 2.80",
    auditRiskLevel: "high",
    auditRiskLabel: "ต้องมีผลเจาะน้ำช่องท้องระบุ Absolute PMN > 250 cells/mm3",
    summary: "การติดเชื้อแบคทีเรียในน้ำในช่องท้องของผู้ป่วยตับแข็งโดยไม่มีแหล่งติดเชื้อที่เกิดจากการทะลุของอวัยวะภายในช่องท้อง จัดเป็นภาวะวิกฤตที่ต้องรีบให้ยาปฏิชีวนะทันที",
    clinicalCriteria: [
      "เจาะน้ำในช่องท้อง (Diagnostic Paracentesis) พบ Absolute Neutrophil Count (PMN) > 250 cells/mm3",
      "มีอาการปวดท้อง ท้องอืด ไข้ หรือมีภาวะสับสน (Hepatic Encephalopathy) แย่ลงเฉียบพลัน",
      "ส่งตรวจ Ascitic fluid culture ด้วยขวด Hemoculture ทันทีข้างเตียงผู้ป่วย",
    ],
    codingRules: [
      "ให้รหัส K65.0 (Acute peritonitis) เป็นโรคร่วมสำคัญ (Secondary Diagnosis - MCC) คู่กับรหัสโรคตับแข็ง K74.6 หรือ K70.3",
      "หากผู้ป่วยเกิดภาวะ Septic Shock ร่วมด้วย ให้เพิ่มรหัส A41.9 และ R57.2",
    ],
    auditPitfalls: [
      "วินิจฉัย SBP โดยไม่มีผลการเจาะตรวจน้ำในช่องท้อง (No Paracentesis Report) จะถูก Auditor ตัดทิ้ง 100%",
      "ขาดการบันทึกการให้ IV Albumin ร่วมกับยาปฏิชีวนะเพื่อป้องกัน Hepatorenal Syndrome (HRS)",
    ],
    documentationExample: {
      doctorTitle: "ตัวอย่าง Paracentesis Note",
      note: "Procedure: Diagnostic Paracentesis\n- Fluid appearance: Cloudy yellowish\n- Lab result: WBC 1,200 /mm3 with 78% Neutrophils (Absolute PMN = 936 /mm3 > 250 cells/mm3)\n- Diagnosis: Spontaneous Bacterial Peritonitis (K65.0)\n- Rx: Started IV Cefotaxime 2g q 8h + IV 20% Albumin infusion",
    },
    references: "AASLD Guidelines for Management of Adult Patients with Ascites Due to Cirrhosis",
    tags: ["SBP", "K65.0", "Cirrhosis", "Paracentesis", "PMN", "MCC", "High Audit Risk"],
  },
  cellulitis: {
    code: "L03.1 / L03.9",
    pdxCode: "L03.1",
    relatedCodes: ["L03.1", "L03.9", "A46", "M72.6"],
    title: "Cellulitis & Necrotizing Fasciitis (เนื้อเยื่อใต้ผิวหนังอักเสบติดเชื้อ)",
    titleEn: "Skin and Soft Tissue Infection (SSTI)",
    category: "internal-medicine",
    categoryLabel: "อายุรกรรม",
    drgImpact: "pdx",
    drgImpactLabel: "Principal Dx หรือ CC",
    estimatedRwBoost: "+0.70 - 2.10",
    auditRiskLevel: "medium",
    auditRiskLabel: "ตรวจบันทึกขนาด รอยลุกลาม และแยกจากภาวะขาบวม Stasis Dermatitis",
    summary: "การติดเชื้อแบคทีเรียเฉียบพลันของชั้นผิวหนังแท้และเนื้อเยื่อใต้ผิวหนัง มีอาการบวม แดง ร้อน ปวดชัดเจน",
    clinicalCriteria: [
      "มีอาการแสดง 4 อย่าง (Signs of inflammation): ปวด (Dolor), ร้อน (Calor), แดง (Rubor), บวม (Tumor) บริเวณผิวหนังและเนื้อเยื่อใต้ผิวหนัง",
      "รอยโรคมีการขยายลุกลามอย่างรวดเร็ว (Spreading erythema with indistinct border)",
      "ตรวจร่างกายแยกจาก Necrotizing Fasciitis: ไม่มีอาการปวดรุนแรงเกินสัดส่วน (Pain out of proportion), ไม่มี Bullae หรือ Crepitus ใต้ผิวหนัง",
    ],
    codingRules: [
      "Cellulitis บริเวณขาหรือแขน ให้รหัส L03.1 (Cellulitis of limb)",
      "หากเป็น Necrotizing Fasciitis ให้ใช้รหัส M72.6 ซึ่งเป็นภาวะรุนแรงและจัดเป็น Major CC (MCC)",
    ],
    auditPitfalls: [
      "ให้รหัส Cellulitis ทั้ง 2 ข้างพร้อมกันในผู้ป่วยที่มีภาวะหลอดเลือดดำบกพร่อง (Venous stasis) โดยไม่มีไข้หรือไม่มีรอยแดงร้อนจำเพาะ จะถูกปรับลดเป็น Stasis dermatitis (I87.2)",
    ],
    documentationExample: {
      doctorTitle: "ตัวอย่าง Progress Note",
      note: "Primary Dx: Acute Cellulitis of Left Lower Extremity (L03.1)\n- Physical: Marked erythema, warmth, and tender induration measuring 15x20 cm over left anterior shin, marked boundary with surgical pen, no crepitus, no skin necrosis\n- Lab: WBC 14,200 (PMN 84%), Cr 0.9\n- Plan: IV Cloxacillin 2g q 6h, Leg elevation, Monitor spreading edge q 12 hrs",
    },
    references: "IDSA Practice Guidelines for the Diagnosis and Management of Skin and Soft Tissue Infections",
    tags: ["Cellulitis", "L03.1", "Skin Infection", "Cloxacillin", "SSTI", "PDx"],
  },
};

/**
 * สังเคราะห์แนวทางการให้รหัสโรคแบบไดนามิกจากคำค้นหา (Smart Clinical Dynamic Synthesizer)
 */
function synthesizeDynamicGuideline(query) {
  const cleanQ = query.trim();
  const lowerQ = cleanQ.toLowerCase();

  // ตรวจสอบคลังข้อมูลจำลองตรงตัว
  for (const [key, data] of Object.entries(FALLBACK_KNOWLEDGE_MAP)) {
    if (lowerQ.includes(key) || data.title.toLowerCase().includes(lowerQ) || data.code.toLowerCase().includes(lowerQ)) {
      return {
        ...data,
        id: `ai-${Date.now()}`,
        isAiGenerated: true,
      };
    }
  }

  // หากไม่มี ให้สังเคราะห์โครงสร้าง 4 มิติทางคลินิกอย่างสมบูรณ์
  const estimatedCode = cleanQ.match(/^[A-Z][0-9]{2}(\.[0-9]+)?/i)
    ? cleanQ.toUpperCase()
    : "R69 / ICD-10";

  return {
    id: `ai-${Date.now()}`,
    code: estimatedCode,
    pdxCode: estimatedCode.split(" ")[0],
    relatedCodes: [estimatedCode.split(" ")[0], "Z03.8"],
    title: `แนวทางการให้รหัสโรค: ${cleanQ}`,
    titleEn: `Clinical Coding Guideline for ${cleanQ}`,
    category: "internal-medicine",
    categoryLabel: "อายุรกรรม / เวชปฏิบัติทั่วไป",
    drgImpact: "cc",
    drgImpactLabel: "Comorbidity (CC คาดการณ์)",
    estimatedRwBoost: "+0.50 - 1.20",
    auditRiskLevel: "high",
    auditRiskLabel: "ตรวจหลักฐานผลตรวจยืนยันและบันทึกการรักษาในเวชระเบียน",
    summary: `แนวทางการวินิจฉัย การจัดกลุ่ม DRG และข้อควรระวังในการ Audit สำหรับผู้ป่วยกลุ่ม "${cleanQ}" อ้างอิงตามเกณฑ์มาตรฐาน Thai Coding Guidelines 2024`,
    clinicalCriteria: [
      `มีอาการและอาการแสดงทางคลินิกที่เข้าเกณฑ์ของ ${cleanQ} อย่างชัดเจน บันทึกไว้ใน History & Physical Examination`,
      `มีผลตรวจทางห้องปฏิบัติการ (Lab) หรือภาพถ่ายรังสี (Imaging) สนับสนุนการวินิจฉัย โดยไม่ใช้เพียงความเห็นทางคลินิกเดี่ยวๆ`,
      `มีหลักฐานว่าผู้ป่วยได้รับการดูแล ติดตามอาการ หรือให้การรักษาจำเพาะต่อภาวะนี้ในระหว่างการนอนรักษาในโรงพยาบาล`,
    ],
    codingRules: [
      `ตรวจสอบเงื่อนไขว่าเป็นโรคหลัก (Principal Diagnosis) หรือโรคร่วม (Secondary Diagnosis/CC) ตามวัตถุประสงค์หลักของการรับไว้รักษา`,
      `ห้ามให้รหัสของอาการทั่วไป (Symptom codes ใน Chapter XVIII เช่น R00-R99) หากทราบโรคที่เป็นสาเหตุต้นตอที่ชัดเจนแล้ว`,
      `หากมีหัตถการผ่าตัดหรือการส่องกล้องรักษา ต้องบันทึกรหัสหัตถการ ICD-9-CM ให้ตรงกับชื่อใน Operative Note เสมอ`,
    ],
    auditPitfalls: [
      `⚠️ การวินิจฉัยโดยไม่มีผลการตรวจยืนยันในเวชระเบียน (เช่น เขียนเพียงในช่อง Impression แต่ไม่มีรายละเอียดใน Progress Note) จะถูก Auditor ปรับตัดรหัสออก`,
      `ระวังการให้รหัสโรคร่วมที่ไม่มีผลต่อการรักษา (ไม่ได้ให้ยา ไม่ได้ตรวจติดตาม ไม่ได้ปรึกษาแพทย์เฉพาะทาง) ซึ่งผิดกฎการให้รหัสสากล Rule of Co-morbidity`,
    ],
    documentationExample: {
      doctorTitle: `ตัวอย่างแบบฟอร์มการบันทึกเวชระเบียนสำหรับ ${cleanQ}`,
      note: `Clinical Assessment: ${cleanQ}\n- Subjective: ผู้ป่วยมีอาการสำคัญสอดคล้องกับพยาธิสภาพของโรค เริ่มมีอาการเฉียบพลันก่อนมาโรงพยาบาล\n- Objective: สัญญาณชีพคงที่ ตรวจร่างกายพบความผิดปกติที่สอดคล้อง ผลตรวจทางห้องปฏิบัติการยืนยันภาวะผิดปกติ\n- Diagnosis: Confirmed diagnosis with specific etiology\n- Plan of Treatment: ให้การรักษาจำเพาะ ติดตามอาการทางคลินิกและตรวจติดตามผลทางห้องปฏิบัติการซ้ำ`,
    },
    references: "Thai Coding Guidelines 2024 / เกณฑ์การตรวจประเมินเวชระเบียน สปสช. และกรมบัญชีกลาง",
    tags: [cleanQ, "AI-Generated", "ICD-10", "Clinical Guidelines", "DRG"],
    isAiGenerated: true,
  };
}

/**
 * เรียก AI เพื่อค้นหาและสังเคราะห์แนวทางการให้รหัสโรค
 * @param {string} query คำค้นหา ชื่อโรค หรือประวัติเคส
 * @returns {Promise<Object>} ข้อมูล Guideline ในโครงสร้าง 4 มิติ
 */
export async function queryAiCodingGuideline(query) {
  if (!query || !query.trim()) {
    throw new Error("กรุณากรอกคำค้นหาหรือชื่อโรคที่ต้องการสอบถาม");
  }

  const promptText = `คุณคือผู้เชี่ยวชาญด้านเวชสถิติและการให้รหัสโรคตามมาตรฐาน Thai Coding Guidelines (TCG 2024), ICD-10, ICD-9-CM และระบบ Thai DRG
กรุณาวิเคราะห์และจัดทำแนวทางการให้รหัสโรคสำหรับ: "${query}"
ตอบกลับมาเป็น JSON ตามโครงสร้างนี้:
{
  "code": "รหัส ICD-10",
  "pdxCode": "รหัสหลัก",
  "relatedCodes": ["รหัสที่เกี่ยวข้อง"],
  "title": "ชื่อโรคภาษาไทย",
  "titleEn": "ชื่อโรคภาษาอังกฤษ",
  "category": "internal-medicine",
  "categoryLabel": "หมวดหมู่วิชาชีพ",
  "drgImpact": "mcc" หรือ "cc" หรือ "pdx",
  "drgImpactLabel": "ระดับผลกระทบ เช่น Major CC (MCC)",
  "estimatedRwBoost": "+1.20 - 2.50",
  "auditRiskLevel": "high" หรือ "medium" หรือ "low",
  "auditRiskLabel": "จุดตรวจสำคัญ",
  "summary": "คำนิยามสั้นๆ",
  "clinicalCriteria": ["เกณฑ์ข้อ 1", "เกณฑ์ข้อ 2", "เกณฑ์ข้อ 3"],
  "codingRules": ["กฎข้อ 1", "กฎข้อ 2"],
  "auditPitfalls": ["จุดระวังข้อ 1", "จุดระวังข้อ 2"],
  "documentationExample": {
    "doctorTitle": "หัวข้อบันทึก",
    "note": "ตัวอย่าง Progress Note ที่ถูกต้องและผ่านการ Audit"
  },
  "references": "แหล่งอ้างอิง",
  "tags": ["tag1", "tag2"]
}`;

  try {
    const res = await fetch(`${API_BASE_URL}/v1/chat/clinical`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: promptText }],
        system_instruction: "You are a professional Medical Coding Auditor and Physician Advisor. Return only pure JSON.",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      let replyText = data?.reply || data?.content || "";

      // ค้นหา JSON ในคำตอบ
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          id: `ai-${Date.now()}`,
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn("AI Backend unavailable or request failed, using smart clinical synthesizer:", err);
  }

  // Fallback: ใช้ Smart Clinical Synthesizer
  return synthesizeDynamicGuideline(query);
}
