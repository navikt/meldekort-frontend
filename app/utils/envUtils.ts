declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  BASE_PATH: string;
  NODE_ENV: string;
  PORT: string;
  DEKORATOR_MILJO: string;
  MELDEKORT_API_AUDIENCE: string;
  MELDEKORT_API_URL: string;
  MIN_SIDE_URL: string;
  DP_URL: string;
  AAP_URL: string;
  AAP_API_AUDIENCE: string;
  TP_URL: string;
  TP_API_AUDIENCE: string;
  IS_LOCALHOST: string;
  MELDEKORT_API_TOKEN: string;
  AMPLITUDE_API_KEY: string;
  SKAL_LOGGE: string;
}

export function getEnv(key: keyof IEnv) {
  let value = typeof process !== "undefined" ? process.env[key] : "";
  if (!value) value = typeof window !== "undefined" ? window.env[key] : "";

  return value;
}
