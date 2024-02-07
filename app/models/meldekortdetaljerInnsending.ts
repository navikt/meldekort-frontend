import type { KortType } from "~/models/kortType";
import type { KortStatus } from "~/models/meldekort";
import type { Meldegruppe } from "~/models/meldegruppe";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldeperiode } from "~/models/meldeperiode";
import { getHeaders } from "~/utils/fetchUtils";
import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getOboToken } from "~/utils/authUtils";
import { getEnv } from "~/utils/envUtils";

// Request
export interface IMeldekortdetaljerInnsending {
  meldekortId: number;
  kortType: KortType;
  kortStatus: KortStatus;
  meldegruppe: Meldegruppe,
  mottattDato: Date;
  meldeperiode: Jsonify<IMeldeperiode>;
  erArbeidssokerNestePeriode: boolean;
  bruttoBelop?: number;
  fravaersdager: IFravaerInnsending[];
  korrigerbart: boolean;
  begrunnelse: string;
  signatur: boolean;
  sesjonsId: string;
  sporsmalsobjekter: ISporsmalsobjekt[];
}

export interface IFravaerInnsending {
  dagIndeks: number;
  type: {
    typeFravaer: FravaerTypeInnsending;
  };
  arbeidTimer?: number;
}

export enum FravaerTypeInnsending {
  KURS_UTDANNING = "K",
  SYKDOM = "S",
  ANNET_FRAVAER = "X",
  ARBEIDS_FRAVAER = "A"
}

export interface ISporsmalsobjekt {
  advarsel?: string;
  sporsmal: string;
  forklaring?: string;
  svar?: string;
}

// Response
export interface ISendInnMeldekortActionResponse {
  baksystemFeil: boolean;
  innsending: IValideringsResultat | null;
}

export interface IValideringsResultat {
  meldekortId: number;
  status: string;
  arsakskoder: IArsakskode[] | null;
  meldekortdager: IMeldekortDag[] | null;
}

export interface IArsakskode {
  kode: string;
  tekst: string;
  params: string[] | null;
}

export interface IMeldekortDag {
  dag: number;
  arbeidetTimerSum: number | null;
  syk: boolean | null;
  annetFravaer: boolean | null;
  kurs: boolean | null;
  meldegruppe: string | null;
}

async function sendInnMeldekort(onBehalfOfToken: string, melekortApiUrl: string, meldekortdetaljer: IMeldekortdetaljerInnsending): Promise<TypedResponse<IValideringsResultat>> {
  const url = `${melekortApiUrl}/person/meldekort`; // Ja, URLen er litt rar her
  try {
    return await fetch(url, {
      method: "POST",
      headers: getHeaders(onBehalfOfToken),
      body: JSON.stringify(meldekortdetaljer)
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response)
  }
}

export async function sendInnMeldekortAction({ request }: ActionFunctionArgs): Promise<TypedResponse<ISendInnMeldekortActionResponse>> {
  let baksystemFeil = false
  let innsending: IValideringsResultat | null = null

  const onBehalfOfToken = await getOboToken(request)
  const formdata = await request.formData();
  const meldekortdetaljer = JSON.parse(formdata.get("meldekortdetaljer")?.toString() || "{}")
  // Send meldekort
  // Hvis ikke OK, vis feil
  // Hvis OK og uten arsakskoder, gå til Kvittering
  // Hvis OK, men med arsakskoder, gå til Utfylling
  const innsendingResponse = await sendInnMeldekort(onBehalfOfToken, getEnv("MELDEKORT_API_URL"), meldekortdetaljer)

  if (!innsendingResponse.ok) {
    baksystemFeil = true
  } else {
    innsending = await innsendingResponse.json()
  }

  return json({ baksystemFeil, innsending })
}
