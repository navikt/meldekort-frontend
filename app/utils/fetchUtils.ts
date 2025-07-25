import { useCallback, useEffect, useRef } from "react";
import type { SubmitFunction } from "react-router";
import type { useFetcher as useFetcherRR } from "react-router";
import { useFetcher } from "react-router";


export function getHeaders(onBehalfOfToken: string, authHeaderName: string = "TokenXAuthorization") {
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    [authHeaderName]: `Bearer ${onBehalfOfToken}`,
  };
}

// Bare "syntactic sugar" slik at vi kan få Promise fra fetcher.submit()
export function useFetcherWithPromise<T>(opts?: Parameters<typeof useFetcherRR>[0]) {
  const resolveRef = useRef<never>();
  const promiseRef = useRef<Promise<T>>();
  const fetcher = useFetcher<T>(opts);

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
    [fetcher, promiseRef],
  );

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      resolveRef.current(fetcher.data);
      resetResolver();
    }
  }, [fetcher, resetResolver]);

  return { ...fetcher, submit };
}
