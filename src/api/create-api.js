import { setupInterceptors } from "@/api/setup-interceptors";
import axios from "axios";

const ip_address = localStorage.getItem("ip_address")
  ? localStorage.getItem("ip_address")
  : null;

const requestparam = {
  mode: null,
  user: null,
  ip: ip_address,
  lang: null,
  branch_id: null,
  barcode: null,
};

// Base URLs
export const PANACEA_API_BASE_URL =
  import.meta.env.VITE_PANACEA_API_URL ||
  import.meta.env.REACT_APP_PANACEACHS_SERVER ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:51804";

export const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8002";

/**
 * panaceaClient: Base URL ชี้ไปที่ Panacea API สำหรับดึงข้อมูลเวชระเบียนและ Dashboard
 */
export const panaceaClient = axios.create({
  baseURL: PANACEA_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

/**
 * aiClient: Base URL ชี้ไปที่ Smart DRG API สำหรับส่งไฟล์เสียงหรือ Prompt งาน AI
 */
export const aiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 0, // AI / Speech-to-text might take longer
});

// Setup interceptors for both clients (Authorization Bearer Token & CSRF)
setupInterceptors(panaceaClient, { clientName: "panacea" });
setupInterceptors(aiClient, { clientName: "ai" });

// Backward compatibility: alias apiInstance to panaceaClient
export const apiInstance = panaceaClient;


const getResponseError = (data) => {
  if (!data) return null;

  const messageCode = Number(data.messageCode);
  const hasErrorMessageCode =
    Number.isFinite(messageCode) && messageCode >= 400;

  if (data.isSuccess === false || hasErrorMessageCode) {
    return data.message || data.errorMessage || "Request failed";
  }

  return null;
};

const getRequestErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    return (
      responseData.message ||
      responseData.errorMessage ||
      responseData.detail ||
      error?.message ||
      "Request failed"
    );
  }

  return error?.message || "Request failed";
};

async function makeApiRequest(config, signal) {
  try {
    const response = await apiInstance({
      ...config,
      signal,
    });

    const responseError = getResponseError(response.data);

    if (responseError) {
      return { error: responseError, result: null };
    }

    return {
      error: null,
      result: response.data.responseData
        ? response.data.responseData
        : response.data,
      totalSize: response.data?.page || null,
    };
  } catch (error) {
    if (error.name === "CanceledError") {
      return { error: "REQUEST_CANCELED", result: null };
    }

    return { error: getRequestErrorMessage(error), result: null };
  }
}

export const withResolve = (baseEndpoint) => {
  const endpoint = (path = "") => `${baseEndpoint}${path}`;

  return {
    get: (params = {}, options = {}) =>
      makeApiRequest(
        { method: "get", url: endpoint(), params },
        options.signal
      ),

    post: (payload, ignoreRequestparam = false, options = {}) =>
      makeApiRequest(
        {
          method: "post",
          url: endpoint(),
          data: ignoreRequestparam
            ? payload
            : { ...requestparam, requestData: payload },
        },
        options.signal
      ),

    put: (payload, ignoreRequestparam = false, options = {}) =>
      makeApiRequest(
        {
          method: "put",
          url: endpoint(),
          data: ignoreRequestparam
            ? payload
            : { ...requestparam, requestData: payload },
        },
        options.signal
      ),

    delete: (payload, ignoreRequestparam = false, options = {}) =>
      makeApiRequest(
        {
          method: "delete",
          url: endpoint(),
          data: ignoreRequestparam
            ? payload
            : { ...requestparam, requestData: payload },
        },
        options.signal
      ),

    patch: (payload, ignoreRequestparam = false, options = {}) =>
      makeApiRequest(
        {
          method: "patch",
          url: endpoint(),
          data: ignoreRequestparam
            ? payload
            : { ...requestparam, requestData: payload },
        },
        options.signal
      ),

    postExcel: async (
      payload,
      ignoreRequestparam = false,
      filename = "export.xlsx",
      options = {}
    ) => {
      try {
        const response = await apiInstance.post(
          endpoint(),
          ignoreRequestparam
            ? payload
            : { ...requestparam, requestData: payload },
          {
            responseType: "blob",
            signal: options.signal,
          }
        );

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        return { error: null, result: true };
      } catch (error) {
        if (error.name === "CanceledError") {
          return { error: "REQUEST_CANCELED", result: null };
        }

        const errorResponse = error.response
          ? error.response.data
          : error.message;

        return { error: errorResponse, result: null };
      }
    },
  };
};
