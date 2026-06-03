import { useEffect, useState } from "react";

/** Simulates async page load for placeholder pages without a backend. */
export function useSimulatedLoading(delayMs = 480) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return isLoading;
}
