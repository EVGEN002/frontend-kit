import axios from "axios";

import { InvalidResponseError, isRecord } from "./errors";

const SERVER_UNAVAILABLE = "Сервер временно недоступен";
const NETWORK_ERROR = "Нет соединения с сервером";
const TIMEOUT_ERROR = "Сервер не ответил вовремя";
const INVALID_RESPONSE = "Сервер вернул некорректный ответ";
const CANCELED = "Запрос отменён";
const UNKNOWN_ERROR = "Не удалось выполнить запрос";

const MESSAGE_FIELDS = ["detail", "message", "error", "error_message"] as const;

const isHtml = (text: string) => /^\s*</.test(text);

const getText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const text = value.trim();
  return text && !isHtml(text) ? text : null;
};

/* Текст из тела ответа: строка (не HTML) или JSON с одним из MESSAGE_FIELDS */
const getMessageFromBody = (data: unknown): string | null => {
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return typeof parsed === "string" ? getText(parsed) : getMessageFromBody(parsed);
    } catch {
      return getText(data);
    }
  }

  if (!isRecord(data)) return null;

  for (const field of MESSAGE_FIELDS) {
    const text = getText(data[field]);
    if (text) return text;
  }

  return null;
};

/* Текст ошибки для пользователя */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof InvalidResponseError) return INVALID_RESPONSE;
  if (axios.isCancel(error)) return CANCELED;
  if (!axios.isAxiosError(error)) return UNKNOWN_ERROR;
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return TIMEOUT_ERROR;
  }
  if (!error.response) return NETWORK_ERROR;
  if (error.response.status >= 500) return SERVER_UNAVAILABLE;

  return getMessageFromBody(error.response.data) ?? UNKNOWN_ERROR;
};
