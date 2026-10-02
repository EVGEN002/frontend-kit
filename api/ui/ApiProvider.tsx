import { useMemo } from "react";
import type { ReactNode } from "react";

import { ApiContext } from "../lib/ApiContext";
import { createApiClient } from "../lib/createApiClient";
import type { ApiConfig, QueryParams } from "../lib/createApiClient";

type ApiProviderProps = ApiConfig & {
  children?: ReactNode;
};

const ApiProvider = ({
  baseURL,
  apiKey,
  queryParams,
  authPath,
  children,
}: ApiProviderProps) => {
  /*
    queryParams обычно передают литералом — сравниваем по содержимому,
    чтобы не пересоздавать клиент на каждый рендер.
  */
  const queryParamsKey = JSON.stringify(queryParams ?? {});

  const api = useMemo(
    () =>
      createApiClient({
        baseURL,
        apiKey,
        authPath,
        queryParams: JSON.parse(queryParamsKey) as QueryParams,
      }),
    [baseURL, apiKey, authPath, queryParamsKey],
  );

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export { ApiProvider };
export type { ApiProviderProps };
