import { useEffect, useState } from "react";

export interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
}

export type FetchResponseType = "json" | "text";

/**
 * Simple fetch hook for loading data from a URL.
 *
 * @param url - The URL to fetch from
 * @param options - Optional RequestInit options for fetch
 * @param responseType - Response type: "json" (default) or "text"
 * @returns Object with data (parsed content or null) and error (Error or null)
 */
export function useFetch<T = any>(
  url: string,
  options?: RequestInit,
  responseCallback: (response: Response) => Promise<T> = async (response) => response.json(),
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await responseCallback(response);
        setData(content);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      }
    };

    fetchData();
  }, [url, options, responseCallback]);

  return { data, error };
}
