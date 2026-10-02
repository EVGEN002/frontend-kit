import axios from "axios";
import type { AxiosInstance } from "axios";

export type QueryParams = Record<string, string | number | boolean>;

export type ApiConfig = {
  baseURL?: string;
  apiKey?: string;
  queryParams?: QueryParams;
  authPath?: string;
};

export const REQUEST_TIMEOUT = 30_000;

const isSamePage = (url: URL) =>
  url.origin === window.location.origin &&
  url.pathname === window.location.pathname &&
  url.search === window.location.search;

export const createApiClient = ({
  baseURL = "",
  apiKey,
  queryParams,
  authPath,
}: ApiConfig): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL.replace(/\/+$/, ""),
    params: queryParams,
    timeout: REQUEST_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  /* Несколько параллельных 401 не должны перенаправлять повторно */
  let isRedirecting = false;

  client.interceptors.response.use(undefined, (error: unknown) => {
    if (
      authPath &&
      !isRedirecting &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      try {
        const target = new URL(authPath, window.location.href);

        /* Уже на странице авторизации — редирект дал бы бесконечный цикл */
        if (!isSamePage(target)) {
          isRedirecting = true;
          window.location.assign(target.href);
        }
      } catch {
        /* Некорректный authPath: остаёмся на странице, ошибку покажет UI */
      }
    }

    return Promise.reject(error);
  });

  return client;
};
