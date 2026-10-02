import axios from "axios";

/* Ответ пришёл, но не в том формате (например, HTML-заглушка прокси вместо JSON) */
export class InvalidResponseError extends Error {
  name = "InvalidResponseError";

  constructor(message = "Invalid response format") {
    super(message);
  }
}

export const isCanceledError = (error: unknown): boolean => axios.isCancel(error);

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
