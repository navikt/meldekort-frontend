declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  NODE_ENV: string;
  PORT: string;
  DEKORATOR_MILJO: string;
  MELDEKORT_API_AUDIENCE: string;
  MELDEKORT_API_URL: string;
  MIN_SIDE_URL: string;
  IS_LOCALHOST: string;
  MELDEKORT_API_TOKEN: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== "undefined" ? window.env : process.env;

  return env[value] || "";
}
