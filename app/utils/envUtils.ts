declare global {
  interface Window {
    env: IEnv;
  }
}

interface IEnv {
  NODE_ENV: string;
  PORT: string;
  BASE_PATH: string;
  DEKORATOR_MILJO: string;
  MELDEKORT_API_URL: string;
  LOGIN_URL: string;
  LOGOUT_URL: string;
}

export function getEnv(value: keyof IEnv) {
  const env = typeof window !== "undefined" ? window.env : process.env;

  return env[value] || "";
}
