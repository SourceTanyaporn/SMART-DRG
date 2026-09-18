/**
 * Helper to identify whether a speaker is Doctor (แพทย์ / หมอ - speak00) or Patient (ผู้ป่วย - speak01)
 */
export function isDoctorSpeaker(speaker, role) {
    if (role === "doctor") return true;
    if (role === "patient") return false;
    if (!speaker) return false;
    const s = String(speaker).trim().toLowerCase();
    return (
        s === "speak00" ||
        s === "speaker_00" ||
        s === "speaker00" ||
        s === "spk_00" ||
        s === "spk00" ||
        s === "speaker_0" ||
        s === "speak0" ||
        s === "0" ||
        s === "doctor" ||
        s.includes("หมอ") ||
        s.includes("แพทย์") ||
        /^(speak|speaker|spk)[-_]?0*0$/i.test(s)
    );
}

export function isPatientSpeaker(speaker, role) {
    if (role === "patient") return true;
    if (role === "doctor") return false;
    if (!speaker) return true;
    const s = String(speaker).trim().toLowerCase();
    return (
        s === "speak01" ||
        s === "speaker_01" ||
        s === "speaker01" ||
        s === "spk_01" ||
        s === "spk01" ||
        s === "speaker_1" ||
        s === "speak1" ||
        s === "1" ||
        s === "patient" ||
        s.includes("ผู้ป่วย") ||
        s.includes("คนไข้") ||
        /^(speak|speaker|spk)[-_]?0*1$/i.test(s)
    );
}

export function getSpeakerRoleInfo(msg) {
    if (!msg) return { isDoctor: false, label: "ผู้ป่วย", speakerCode: "speak01" };

    let isDoc = false;
    if (typeof msg.doctor === "boolean") {
        isDoc = msg.doctor;
    } else if (msg.role) {
        isDoc = isDoctorSpeaker(msg.speaker, msg.role);
    } else {
        isDoc = isDoctorSpeaker(msg.speaker || msg.name);
    }

    return {
        isDoctor: isDoc,
        label: isDoc ? "แพทย์" : "ผู้ป่วย",
        speakerCode: isDoc ? "speak00" : "speak01",
    };
}
