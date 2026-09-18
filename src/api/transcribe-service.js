import { aiClient } from "@/api/create-api";

export const TranscribeService = {
  /**
   * ส่งไฟล์เสียงสำหรับแปลงเสียงเป็นข้อความ (Speech-to-Text)
   */
  transcribe: async (file, postProcess = "openai") => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("language", "th");
    formData.append("task", "transcribe");
    formData.append("post_process", postProcess);

    const response = await aiClient.post("/v1/transcribe", formData);

    return response.data;
  },

  /**
   * ตรวจสอบสถานะงาน Transcription
   */
  getStatus: async (jobId) => {
    const response = await aiClient.get(`/v1/transcribe/status/${jobId}`);

    return response.data;
  },

  /**
   * ส่ง Prompt งาน AI Clinical Chat / Assistant
   */
  chatClinical: async (payload) => {
    const response = await aiClient.post("/v1/chat/clinical", payload);

    return response.data;
  },

  /**
   * ส่งข้อความเพื่อดึงข้อมูลฟอร์มทางคลินิก (Extract Form)
   */
  extractForm: async (payload) => {
    const response = await aiClient.post("/v1/extract-form", payload);

    return response.data;
  },
};