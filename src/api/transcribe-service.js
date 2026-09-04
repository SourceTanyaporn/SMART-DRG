import axios from "axios";

const transcribeApi = axios.create({
  baseURL: "/transcribe",
  timeout: 0,
});

export const TranscribeService = {
  transcribe: async (file, postProcess = "openai") => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("language", "th");
    formData.append("task", "transcribe");
    formData.append("post_process", postProcess);

    const response = await transcribeApi.post("", formData);

    return response.data;
  },

  getStatus: async (jobId) => {
    const response = await transcribeApi.get(`/status/${jobId}`);

    return response.data;
  },
};