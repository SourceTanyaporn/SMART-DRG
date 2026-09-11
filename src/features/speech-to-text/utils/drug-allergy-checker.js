// Clinical Drug Allergy & CDS Knowledge Base
export const DRUG_GROUPS = [
    {
        id: "penicillins",
        name: "Penicillins & Beta-lactams",
        thaiName: "กลุ่มเพนิซิลลินและเบต้า-แลกแทม",
        crossGroups: ["cephalosporins", "carbapenems"],
        drugs: [
            { name: "Penicillin", aliases: ["penicillin", "penicillin v", "penicillin g", "pen v", "pen g", "เพนนิซิลิน", "เพนิซิลลิน", "เพนวี"] },
            { name: "Amoxicillin", aliases: ["amoxicillin", "amoxil", "amoxycillin", "amoxy", "อะม็อกซี่", "อะม็อกซีซิลลิน", "อะมอกซิซิลลิน", "amox"] },
            { name: "Amoxicillin + Clavulanate", aliases: ["augmentin", "cavumox", "amoxiclav", "amoxicillin/clavulanate", "amoxicillin-clavulanic", "อ็อกเมนติน", "ออคเมนติน"] },
            { name: "Ampicillin", aliases: ["ampicillin", "แอมพิซิลิน", "แอมพิซิลลิน", "ampicil"] },
            { name: "Ampicillin + Sulbactam", aliases: ["unasyn", "sultamicillin", "ยูนาซิน", "แอมพิซิลิน ซัลแบคแทม"] },
            { name: "Cloxacillin", aliases: ["cloxacillin", "cloxa", "ค็อกซ่า", "คลอกซาซิลลิน", "คลอกซา"] },
            { name: "Dicloxacillin", aliases: ["dicloxacillin", "dicloxa", "ไดคล็อกซ่า", "ไดคลอกซาซิลลิน", "ไดคลอกซ่า"] },
            { name: "Piperacillin + Tazobactam", aliases: ["tazocin", "piptazo", "piperacillin", "ทาโซซิน", "พิพทาโซ"] },
        ],
    },
    {
        id: "cephalosporins",
        name: "Cephalosporins (Beta-lactam Related)",
        thaiName: "กลุ่มเซฟาโลสปอริน",
        crossGroups: ["penicillins", "carbapenems"],
        drugs: [
            { name: "Cephalexin", aliases: ["cephalexin", "keflex", "เซฟาเลกซิน", "เซฟาเลก"] },
            { name: "Cefazolin", aliases: ["cefazolin", "เซฟาโซลิน"] },
            { name: "Cefuroxime", aliases: ["cefuroxime", "zinnat", "เซฟูรอกซิม", "ซินแนท"] },
            { name: "Ceftriaxone", aliases: ["ceftriaxone", "rocephin", "เซฟไตร", "เซฟไตรอะโซน", "โรเซฟิน"] },
            { name: "Cefotaxime", aliases: ["cefotaxime", "claforan", "เซโฟแทกซิม"] },
            { name: "Cefixime", aliases: ["cefixime", "เซฟิกซิม"] },
            { name: "Cefdinir", aliases: ["cefdinir", "omnicef", "เซฟดินีร์"] },
            { name: "Ceftazidime", aliases: ["ceftazidime", "fortum", "เซฟทาซิดิม"] },
        ],
    },
    {
        id: "carbapenems",
        name: "Carbapenems (Beta-lactam Related)",
        thaiName: "กลุ่มคาร์บาพีเนม",
        crossGroups: ["penicillins", "cephalosporins"],
        drugs: [
            { name: "Meropenem", aliases: ["meropenem", "meronem", "เมโรพีเนม"] },
            { name: "Imipenem", aliases: ["imipenem", "tienam", "อิมิพีเนม"] },
            { name: "Ertapenem", aliases: ["ertapenem", "invanz", "เออร์ทาพีเนม"] },
        ],
    },
    {
        id: "sulfonamides",
        name: "Sulfonamides (Sulfa Drugs)",
        thaiName: "กลุ่มซัลโฟนาไมด์ (ซัลฟา)",
        crossGroups: [],
        drugs: [
            { name: "Co-trimoxazole / Bactrim", aliases: ["bactrim", "cotrimoxazole", "co-trimoxazole", "sulfamethoxazole", "trimethoprim", "แบคทริม", "โคไตร", "โคไตรม็อกซาโซล", "ซัลฟา"] },
            { name: "Sulfasalazine", aliases: ["sulfasalazine", "salazopyrin", "ซัลฟาซาลาซีน"] },
            { name: "Silver Sulfadiazine", aliases: ["silver sulfadiazine", "silvadene", "ซิลเวอร์ ซัลฟาไดอะซีน"] },
        ],
    },
    {
        id: "nsaids",
        name: "NSAIDs & Aspirin",
        thaiName: "กลุ่มยาแก้ปวดแก้อักเสบที่ไม่ใช่สเตียรอยด์ (NSAIDs)",
        crossGroups: [],
        drugs: [
            { name: "Aspirin", aliases: ["aspirin", "asa", "แอสไพริน", "แอสไพริน 81"] },
            { name: "Ibuprofen", aliases: ["ibuprofen", "nurofen", "advil", "ไอบูโพรเฟน", "นูโรเฟน"] },
            { name: "Naproxen", aliases: ["naproxen", "synflex", "นาพรอกเซน"] },
            { name: "Diclofenac", aliases: ["diclofenac", "voltaren", "ไดโคลฟีแนค", "โวลทาเรน"] },
            { name: "Mefenamic Acid", aliases: ["mefenamic", "ponstan", "พอนสแตน", "เมเฟนามิก"] },
            { name: "Meloxicam", aliases: ["meloxicam", "mobic", "เมล็อกซิแคม"] },
            { name: "Piroxicam", aliases: ["piroxicam", "feldene", "ไพร็อกซิแคม"] },
            { name: "Celecoxib", aliases: ["celecoxib", "celebrex", "ซีลีเบร็กซ์", "เซเลคอกซิบ"] },
            { name: "Etoricoxib", aliases: ["etoricoxib", "arcoxia", "อาร์ค็อกเซีย", "เอทอริคอกซิบ"] },
            { name: "Indomethacin", aliases: ["indomethacin", "อินโดเมธาซิน"] },
        ],
    },
    {
        id: "fluoroquinolones",
        name: "Fluoroquinolones",
        thaiName: "กลุ่มฟลูออโรควิโนโลน",
        crossGroups: [],
        drugs: [
            { name: "Ciprofloxacin", aliases: ["ciprofloxacin", "cipro", "ciprobay", "ซิโปรฟลอกซาซิน", "ซิโปร"] },
            { name: "Levofloxacin", aliases: ["levofloxacin", "cravit", "ลีโวฟลอกซาซิน", "คราวิท"] },
            { name: "Norfloxacin", aliases: ["norfloxacin", "นอร์ฟลอกซาซิน"] },
            { name: "Ofloxacin", aliases: ["ofloxacin", "tarivid", "ออฟลอกซาซิน"] },
            { name: "Moxifloxacin", aliases: ["moxifloxacin", "avelox", "มอกซิฟลอกซาซิน"] },
        ],
    },
    {
        id: "macrolides",
        name: "Macrolides",
        thaiName: "กลุ่มแมคโครไลด์",
        crossGroups: [],
        drugs: [
            { name: "Azithromycin", aliases: ["azithromycin", "zithromax", "อะซิโทรไมซิน", "ซิโธรแมกซ์"] },
            { name: "Clarithromycin", aliases: ["clarithromycin", "klacid", "คลาริโทรไมซิน", "คลาซิด"] },
            { name: "Erythromycin", aliases: ["erythromycin", "อิริโทรมัยซิน", "อิริโทรไมซิน"] },
            { name: "Roxithromycin", aliases: ["roxithromycin", "rulid", "ร็อกซิโทรไมซิน", "รูลิด"] },
        ],
    },
    {
        id: "opioids",
        name: "Opioids & Narcotic Analgesics",
        thaiName: "กลุ่มโอปิออยด์ / ยาระงับปวดชนิดเสพติด",
        crossGroups: [],
        drugs: [
            { name: "Tramadol", aliases: ["tramadol", "tramal", "ทรามาดอล", "ทรามาล"] },
            { name: "Morphine", aliases: ["morphine", "มอร์ฟีน"] },
            { name: "Codeine", aliases: ["codeine", "โคเดอีน"] },
            { name: "Fentanyl", aliases: ["fentanyl", "durogesic", "เฟนทานิล"] },
            { name: "Pethidine", aliases: ["pethidine", "เพทิดีน"] },
        ],
    },
    {
        id: "paracetamol",
        name: "Paracetamol & Acetaminophen",
        thaiName: "กลุ่มยาพาราเซตามอล",
        crossGroups: [],
        drugs: [
            { name: "Paracetamol", aliases: ["paracetamol", "acetaminophen", "tylenol", "sara", "calpol", "cemol", "พารา", "พาราเซตามอล", "ไทลินอล", "ซาร่า", "คาลปอล", "เซมอล", "para 500", "พารา 500"] },
        ],
    },
    {
        id: "gout_allopurinol",
        name: "Allopurinol & Gout Medications",
        thaiName: "ยาอัลโลพูรินอล (ยารักษาเกาต์)",
        crossGroups: [],
        drugs: [
            { name: "Allopurinol", aliases: ["allopurinol", "zyloric", "อัลโลพูรินอล", "ไซโลริก"] },
            { name: "Colchicine", aliases: ["colchicine", "คอลชิซิน", "โคลชิซิน"] },
        ],
    },
];

/**
 * Checks clinical text sources against a patient's known drug allergy record.
 * 
 * @param {Object} patient - The patient object containing allergies & allergyDetails
 * @param {Object} options - Clinical context (transcript, treatmentPlan, note, etc.)
 * @returns {Array} List of detected drug allergy alert objects
 */
export function checkDrugAllergySafety(patient, { transcript = [], treatmentPlan = "", note = "", rawAudioTexts = [] } = {}) {
    if (!patient) return [];

    const allergyStr = (patient.allergies || "").toLowerCase();
    const allergyDetails = Array.isArray(patient.allergyDetails) ? patient.allergyDetails : [];

    // If patient has no recorded allergy
    if (!allergyStr || allergyStr.includes("ไม่มีประวัติแพ้ยา") || (allergyStr.trim() === "-" && allergyDetails.length === 0)) {
        return [];
    }

    // 1. Identify which drug groups and specific drugs the patient is allergic to
    const patientAllergicGroups = new Set();
    const patientAllergicDrugs = [];

    // Match against DRUG_GROUPS dictionary
    DRUG_GROUPS.forEach((group) => {
        let groupMatched = false;

        // Check if group name or any group alias matches patient allergy string or details
        if (allergyStr.includes(group.id) || allergyStr.includes(group.name.toLowerCase()) || allergyStr.includes(group.thaiName.toLowerCase())) {
            groupMatched = true;
        }

        group.drugs.forEach((drug) => {
            const hasDrugAllergy = drug.aliases.some((alias) => allergyStr.includes(alias.toLowerCase())) ||
                allergyDetails.some((det) =>
                    (det.drug && det.drug.toLowerCase().includes(drug.name.toLowerCase())) ||
                    (det.group && det.group.toLowerCase().includes(group.name.toLowerCase()))
                );

            if (hasDrugAllergy) {
                groupMatched = true;
                patientAllergicDrugs.push({
                    drugName: drug.name,
                    groupId: group.id,
                    groupName: group.name,
                    thaiGroupName: group.thaiName,
                });
            }
        });

        if (groupMatched) {
            patientAllergicGroups.add(group.id);
            // Also include cross-sensitive groups (e.g. Penicillin cross-reactivity with Cephalosporins / Carbapenems)
            (group.crossGroups || []).forEach((crossId) => patientAllergicGroups.add(crossId));
        }
    });

    // If patient allergy string didn't directly match our dictionary, treat the raw string as custom target
    if (patientAllergicGroups.size === 0 && patientAllergicDrugs.length === 0 && allergyStr.length > 2) {
        // Fallback simple keyword match
        patientAllergicDrugs.push({
            drugName: patient.allergies,
            groupId: "custom",
            groupName: "Custom Recorded Allergy",
            thaiGroupName: "ประวัติแพ้ยาที่บันทึกไว้",
        });
    }

    // 2. Gather all clinical texts from conversation & treatment plan
    const textSources = [];

    // Spoken transcript segments
    if (Array.isArray(transcript)) {
        transcript.forEach((item, idx) => {
            if (item.text && item.text.trim()) {
                textSources.push({
                    type: "transcript",
                    label: `เสียงสนทนา (${item.doctor ? "แพทย์" : item.name || "ผู้พูด"} - ลำดับที่ ${idx + 1})`,
                    text: item.text,
                    speaker: item.name || (item.doctor ? "แพทย์" : "ผู้ป่วย"),
                    isDoctor: item.doctor ?? false,
                });
            }
        });
    }

    // Audio files raw texts
    if (Array.isArray(rawAudioTexts)) {
        rawAudioTexts.forEach((txt, idx) => {
            if (txt && txt.trim()) {
                textSources.push({
                    type: "audio_file",
                    label: `ไฟล์เสียงที่ ${idx + 1}`,
                    text: txt,
                });
            }
        });
    }

    // Form Treatment Plan
    if (treatmentPlan && treatmentPlan.trim()) {
        textSources.push({
            type: "treatment_plan",
            label: "แผนการรักษา (Treatment Plan)",
            text: treatmentPlan,
        });
    }

    // Form Note
    if (note && note.trim() && note !== treatmentPlan) {
        textSources.push({
            type: "note",
            label: "บันทึกคำสั่งแพทย์ (Doctor's Note)",
            text: note,
        });
    }

    // 3. Scan texts for prescribed drugs that trigger allergy alerts
    const alerts = [];
    const matchedAlertKeys = new Set();

    textSources.forEach((src) => {
        const lowerText = src.text.toLowerCase();

        DRUG_GROUPS.forEach((group) => {
            // Check if patient is allergic to this group or its cross-reactive family
            const isAllergicToGroup = patientAllergicGroups.has(group.id);

            group.drugs.forEach((drug) => {
                // Find if this drug is mentioned in the text
                const matchedAlias = drug.aliases.find((alias) => {
                    // Match word boundaries or substring
                    const a = alias.toLowerCase();
                    if (lowerText.includes(a)) {
                        // Avoid false positives like "ไม่แพ้ยา penicillin" by checking negation near the word
                        const idx = lowerText.indexOf(a);
                        const preceding = lowerText.substring(Math.max(0, idx - 25), idx);
                        if (preceding.includes("ไม่แพ้") || preceding.includes("ปฏิเสธการแพ้") || preceding.includes("no allergy")) {
                            return false;
                        }
                        return true;
                    }
                    return false;
                });

                if (matchedAlias) {
                    // Check if patient has direct allergy or group cross-allergy
                    const isDirectMatch = patientAllergicDrugs.some(
                        (pad) => pad.drugName.toLowerCase() === drug.name.toLowerCase() ||
                            drug.aliases.some((al) => pad.drugName.toLowerCase().includes(al.toLowerCase()))
                    );

                    const isCrossReaction = isAllergicToGroup && !isDirectMatch;

                    if (isDirectMatch || isCrossReaction) {
                        const alertKey = `${group.id}-${drug.name}`;
                        if (!matchedAlertKeys.has(alertKey)) {
                            matchedAlertKeys.add(alertKey);

                            // Extract snippet around the matched word for context
                            const idx = lowerText.indexOf(matchedAlias.toLowerCase());
                            const startIdx = Math.max(0, idx - 30);
                            const endIdx = Math.min(src.text.length, idx + matchedAlias.length + 50);
                            const snippet = (startIdx > 0 ? "..." : "") + src.text.substring(startIdx, endIdx).trim() + (endIdx < src.text.length ? "..." : "");

                            // Find patient's documented reaction if available
                            const matchingDetail = allergyDetails.find((d) =>
                                (d.drug && d.drug.toLowerCase().includes(drug.name.toLowerCase())) ||
                                (d.group && d.group.toLowerCase().includes(group.name.toLowerCase()))
                            ) || allergyDetails[0] || {};

                            alerts.push({
                                id: `allergy-alert-${alertKey}-${Date.now()}`,
                                severity: isDirectMatch ? "CRITICAL" : "HIGH",
                                isDirectMatch,
                                isCrossReaction,
                                detectedDrug: drug.name,
                                detectedAlias: matchedAlias,
                                detectedIn: src.label,
                                snippet,
                                groupName: group.name,
                                thaiGroupName: group.thaiName,
                                patientAllergy: patient.allergies,
                                reaction: matchingDetail.reaction || "ผื่นคัน, แน่นหน้าอก, หลอดลมหดเกร็ง",
                                severityLevel: matchingDetail.severity || (isDirectMatch ? "Severe / Anaphylaxis Risk" : "Cross-Reactivity Warning"),
                                recommendation: isDirectMatch
                                    ? `⚠️ ห้ามใช้ยานี้เด็ดขาด! ผู้ป่วยมีประวัติแพ้ยา ${drug.name} (${patient.allergies}) แนะนำเปลี่ยนเป็นยากลุ่มอื่นที่ปลอดภัย`
                                    : `⚠️ ระวังการแพ้ข้ามกลุ่ม (Cross-Reactivity)! ผู้ป่วยแพ้ยากลุ่ม ${group.name} ซึ่งมีโอกาสเกิดปฏิกิริยาแพ้ข้ามกับ ${drug.name}`,
                            });
                        }
                    }
                }
            });
        });
    });

    return alerts;
}
