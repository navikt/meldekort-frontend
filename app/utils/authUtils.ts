import { getToken, requestTokenxOboToken, validateIdportenToken } from "@navikt/oasis";

import { getEnv } from "~/utils/envUtils";


export const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export async function getOboToken(request: Request) {
  if (getEnv("IS_LOCALHOST") === "true") {
    return getEnv("MELDEKORT_API_TOKEN") || FALLBACK_TOKEN;
  }

  const token = getToken(request);
  if (!token) {
    throw new Response(null, { status: 500, statusText: "Feil ved henting av token fra request" });
  }

  const validation = await validateIdportenToken(token);
  if (!validation.ok) {
    throw new Response(null, { status: 500, statusText: "Feil ved validering av token" });
  }

  const obo = await requestTokenxOboToken(token, getEnv("MELDEKORT_API_AUDIENCE"));
  if (!obo.ok) {
    throw new Response(null, { status: 500, statusText: "Feil ved henting  av obo token" });
  }

  return obo.token;
}
