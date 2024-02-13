import { makeSession, type GetSessionWithOboProvider } from "@navikt/oasis";
import { idporten } from "@navikt/oasis/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/oasis/obo-providers";
import { getEnv } from "~/utils/envUtils";

export const FALLBACK_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export let getSession: GetSessionWithOboProvider;

if (process.env.IS_LOCALHOST !== "true") {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withInMemoryCache(tokenX),
  });
}

export async function getOboToken(request: Request) {
  if (process.env.IS_LOCALHOST === "true") {
    return process.env.MELDEKORT_API_TOKEN || FALLBACK_TOKEN;
  }

  const session = await getSession(request);

  if (!session) {
    throw new Response(null, { status: 500, statusText: "Feil ved henting av sesjon" });
  }

  return session.apiToken(getEnv("MELDEKORT_API_AUDIENCE"));
}
