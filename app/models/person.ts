import { getEnv } from "~/utils/envUtils";
import type { IMeldekort } from "~/models/meldekort";
import { getHeaders } from "~/utils/fetchUtils";
import type { TypedResponse } from "@remix-run/node";


export interface IPerson {
  maalformkode: string;
  meldeform: MeldeForm;
  meldekort: IMeldekort[];
  etterregistrerteMeldekort: IMeldekort[];
  fravaer: IFravaer[];
  id: string;
  antallGjenstaaendeFeriedager: number;
}

export enum MeldeForm {
  ELEKTRONISK = "EMELD",
  PAPIR = "PAPIR",
  MANUELL = "MANU",
  AUTO = "AUTO",
  IKKE_SATT = "IKKE SATT"
}

export interface IFravaer {
  fraDato: Date;
  tilDato: Date;
  type: FravaerType;
}

export enum FravaerType {
  KURS_UTDANNING = "K",
  SYKDOM = "S",
  ANNET_FRAVAER = "X",
  ARBEIDS_FRAVAER = "F"
}

export interface IPersonInfo {
  personId: number;
  fodselsnr: string;
  etternavn: string;
  fornavn: string;
}

export async function hentPerson(onBehalfOfToken: string): Promise<TypedResponse<IPerson>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/meldekort`; // Ja, URLen er litt rar her

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken),
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}

export async function hentPersonInfo(onBehalfOfToken: string): Promise<TypedResponse<IPersonInfo>> {
  const url = `${getEnv("MELDEKORT_API_URL")}/person/info`;

  try {
    return await fetch(url, {
      method: "GET",
      headers: getHeaders(onBehalfOfToken),
    });
  } catch (err) {
    const response = new Response(null, { status: 500, statusText: (err as Error).message });

    return Promise.resolve(response);
  }
}
