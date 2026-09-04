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

export const apiInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://container2.crhospital.org/panacea-claim",
  timeout: 0,
  withCredentials: true,
});

setupInterceptors(apiInstance);

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
