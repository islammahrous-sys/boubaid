import { useState, useEffect } from "react";

/**
 * Custom hook that delays updating the returned value until delayMs milliseconds
 * have elapsed since the last time the input alue changed.
 *
 * Essential for search inputs to prevent request storms and race conditions.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
