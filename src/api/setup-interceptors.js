export function setupInterceptors(instance) {
  instance.interceptors.request.use(
    async (config) => {
      const csrfToken = localStorage.getItem("csrfToken");

      if (csrfToken) {
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
        if (!url.includes("/fdh-verify-auth")) {
          localStorage.removeItem("csrfToken");
          window.location.replace("/panacea-claim/api/key-cloak/login");
        }
      }
      return Promise.reject(error);
    }
  );
}
