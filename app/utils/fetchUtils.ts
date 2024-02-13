import type { useFetcher as useFetcherRR } from "react-router-dom";
import type { SubmitFunction } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useRef } from "react";

export function getHeaders(onBehalfOfToken: string) {
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "TokenXAuthorization": `Bearer ${onBehalfOfToken}`
  }
}

// Bare "syntactic sugar" slik at vi kan få Promise fra fetcher.submit()
export function useFetcherWithPromise<T>(opts?: Parameters<typeof useFetcherRR>[0]) {
  let resolveRef = useRef<any>();
  let promiseRef = useRef<Promise<T>>();
  let fetcher = useFetcher<T>(opts);

  if (!promiseRef.current) {
    promiseRef.current = new Promise<T>((resolve) => {
      resolveRef.current = resolve;
    });
  }

  const resetResolver = useCallback(() => {
    promiseRef.current = new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, [promiseRef, resolveRef]);

  const submit = useCallback(
    async (...args: Parameters<SubmitFunction>) => {
      fetcher.submit(...args);
      return promiseRef.current;
    },
    [fetcher, promiseRef]
  );

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      resolveRef.current(fetcher.data);
      resetResolver();
    }
  }, [fetcher, resetResolver]);

  return { ...fetcher, submit };
}
