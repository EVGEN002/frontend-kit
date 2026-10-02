import { createContext, useContext } from "react";
import type { AxiosInstance } from "axios";

export const ApiContext = createContext<AxiosInstance | null>(null);

export const useApi = (): AxiosInstance => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error("useApi must be used inside <ApiProvider>");
  }

  return context;
};
