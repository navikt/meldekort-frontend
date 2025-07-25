import type { ActionFunctionArgs } from "react-router";

import { Innsendingstype } from "~/models/innsendingstype";
import { KortType } from "~/models/kortType";
import { hentMeldekortIdForKorrigering } from "~/models/meldekort";
import {
  IMeldekortdetaljerInnsending, ISendInnMeldekortActionResponse,
  IValideringsResultat,
} from "~/models/meldekortdetaljerInnsending";
import { getOboToken } from "~/utils/authUtils";
import { getEnv } from "~/utils/envUtils";
import { getHeaders } from "~/utils/fetchUtils";


async function sendInnMeldekort(onBehalfOfToken: string, melekortApiUrl: string, meldekortdetaljer: IMeldekortdetaljerInnsending): Promise<Response> {
  const url = `${melekortApiUrl}/person/meldekort`; // Ja, URLen er litt rar her
  try {
    return await fetch(url, {
      method: "POST",
      headers: getHeaders(onBehalfOfToken),
      body: JSON.stringify(meldekortdetaljer),
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}

export async function sendInnMeldekortAction({ request }: ActionFunctionArgs): Promise<ISendInnMeldekortActionResponse> {
  let baksystemFeil = false;
  let innsending: IValideringsResultat | null = null;

  const onBehalfOfToken = await getOboToken(request);
  const formdata = await request.formData();
  const meldekortdetaljer = JSON.parse(formdata.get("meldekortdetaljer")?.toString() || "{}");

  // Vi må opprette et nytt meldekort og få en ny meldekortId først hvis det er korrigering
  if (formdata.get("innsendingstype") === Innsendingstype.KORRIGERING.toString()) {
    const nyMeldekortIdResponse = await hentMeldekortIdForKorrigering(onBehalfOfToken, meldekortdetaljer.meldekortId);

    if (nyMeldekortIdResponse.ok) {
      meldekortdetaljer.meldekortId = await nyMeldekortIdResponse.json();
      meldekortdetaljer.kortType = KortType.KORRIGERT_ELEKTRONISK
    } else {
      baksystemFeil = true;
    }
  }

  // Hvis vi ikke har baksystemFeil ennå, fortsett
  if (!baksystemFeil) {
    // Send meldekort
    // Hvis ikke OK, vis feil
    // Hvis OK og uten arsakskoder, gå til Kvittering
    // Hvis OK, men med arsakskoder, gå til Utfylling
    const innsendingResponse = await sendInnMeldekort(onBehalfOfToken, getEnv("MELDEKORT_API_URL"), meldekortdetaljer);

    if (!innsendingResponse.ok) {
      baksystemFeil = true;
    } else {
      innsending = await innsendingResponse.json();
    }
  }

  return { baksystemFeil, innsending };
}
