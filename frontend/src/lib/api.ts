// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL
//     ? `${import.meta.env.VITE_API_URL}/api`
//     : "http://localhost:5000/api",
// });

// api.interceptors.request.use((config) => {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   if (user && user.token) {
//     config.headers.Authorization = `Bearer ${user.token}`;
//   }
//   return config;
// });

// export default api;

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const ENV_API = (import.meta.env.VITE_API_URL as string | undefined) || "";
const BASE_URL = ENV_API.trim()
  ? ENV_API.replace(/\/+$/g, "") + "/api"
  : typeof window !== "undefined"
  ? `${window.location.origin}/api`
  : "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const safeParse = (value: string | null) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

api.interceptors.request.use((config: AxiosRequestConfig) => {
  const stored = safeParse(localStorage.getItem("user"));
  const token =
    stored && typeof stored === "object" && "token" in stored
      ? (stored as any).token
      : null;
  config.headers = config.headers || {};
  if (token) (config.headers as any).Authorization = `Bearer ${token}`;
  return config;
});

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: any }) => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;
    const shouldRetry =
      (!error.response || (error.response && error.response.status >= 500)) &&
      config.__retryCount < 2;
    if (shouldRetry) {
      config.__retryCount += 1;
      const backoff = 200 * Math.pow(2, config.__retryCount);
      await sleep(backoff);
      return api.request(config);
    }
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem("user");
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
