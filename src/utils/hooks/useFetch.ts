import { useEffect, useState } from "react";

export interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Simple fetch hook for loading data from a URL.
 *
 * @param url - The URL to fetch from
 * @param options - Optional RequestInit options for fetch
 * @returns Object with data (parsed JSON or null) and error (Error or null)
 */
export function useFetch<T = any>(
  url: string,
  options?: RequestInit
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
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, error };
}
