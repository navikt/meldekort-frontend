import { makeSession, type GetSessionWithOboProvider } from "@navikt/dp-auth";
import { idporten } from "@navikt/dp-auth/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/dp-auth/obo-providers";
import { getEnv } from "~/utils/envUtils";

const fallbackToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export let getSession: GetSessionWithOboProvider;

if (process.env.IS_LOCALHOST === "true") {
  getSession = makeSession({
    identityProvider: async () => process.env.MELDEKORT_API_TOKEN || fallbackToken,
    oboProvider: process.env.MELDEKORT_API_TOKEN
      ? tokenX
      : async (token: string, audience: string) => token + audience,
  });
} else {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withInMemoryCache(tokenX),
  });
}

export async function getOboToken(request: Request) {
  const session = await getSession(request);

  if (!session) {
    throw new Response(null, { status: 500, statusText: "Feil ved henting av sesjon" });
  }

  if (process.env.IS_LOCALHOST === "true") {
    return process.env.MELDEKORT_API_TOKEN || fallbackToken;
  }

  return session.apiToken(getEnv("MELDEKORT_API_AUDIENCE"));
}
