/**
 * Helper to retrieve authentication bearer token from LocalStorage or Cookies
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;

  // 1. Check common token keys in LocalStorage
  const tokenKeys = [
    "token",
    "access_token",
    "accessToken",
    "jwt",
    "authToken",
    "bearerToken",
    "id_token",
    "auth_token",
  ];

  for (const key of tokenKeys) {
    const val = localStorage.getItem(key);
    if (val && typeof val === "string" && val.trim()) {
      return val.replace(/^Bearer\s+/i, "").trim();
    }
  }

  // 2. Check JSON objects in LocalStorage that might contain tokens
  const userJsonKeys = ["user", "currentUser", "auth", "session"];
  for (const key of userJsonKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const possibleToken =
            parsed.token ||
            parsed.accessToken ||
            parsed.access_token ||
            parsed.jwt;
          if (possibleToken && typeof possibleToken === "string") {
            return possibleToken.replace(/^Bearer\s+/i, "").trim();
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // 3. Check document.cookie
  if (typeof document !== "undefined" && document.cookie) {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [rawName, ...rest] = cookie.trim().split("=");
      const name = rawName?.trim();
      if (
        name &&
        (tokenKeys.includes(name) ||
          name.toLowerCase().includes("token") ||
          name.toLowerCase() === "jwt")
      ) {
        const val = decodeURIComponent(rest.join("=")).trim();
        if (val) {
          return val.replace(/^Bearer\s+/i, "").trim();
        }
      }
    }
  }

  return null;
}

export function setupInterceptors(instance, options = {}) {
  instance.interceptors.request.use(
    async (config) => {
      // 1. Attach Authorization Bearer Token automatically
      const token = getAuthToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Attach CSRF Token if present
      const csrfToken = localStorage.getItem("csrfToken");
      if (csrfToken && !config.headers["X-Csrf-Token"]) {
        config.headers["X-Csrf-Token"] = csrfToken;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        const url = error.config?.url || "";
        if (!url.includes("/fdh-verify-auth") && !url.includes("/login")) {
          localStorage.removeItem("csrfToken");
          // If running within Panacea Claim ecosystem, redirect to login
          if (typeof window !== "undefined" && window.location.pathname.startsWith("/panacea-claim")) {
            window.location.replace("/panacea-claim/api/key-cloak/login");
          }
        }
      }
      return Promise.reject(error);
    }
  );
}

