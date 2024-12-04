import { http, HttpResponse } from "msw";

import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import {
  TEST_HISTORISKEMELDEKORT,
  TEST_INFOMELDING,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_MELDEKORTDETALJER,
  TEST_PERSON,
  TEST_PERSON_INFO,
  TEST_PERSON_STATUS,
  TEST_SKRIVEMODUS,
} from "./data";


export const handlers = [

  http.post(
    `${TEST_MELDEKORT_API_URL}/person/meldekort`,
    () => HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/meldekort`,
    () => HttpResponse.json(TEST_PERSON, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/info`,
    () => HttpResponse.json(TEST_PERSON_INFO, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
    () => HttpResponse.json(TEST_HISTORISKEMELDEKORT, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/status`,
    () => HttpResponse.json(TEST_PERSON_STATUS, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/meldekort/1708156951/korrigering`,
    () => HttpResponse.json(1708156952, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/meldekort/1707156949`,
    () => HttpResponse.json(TEST_MELDEKORTDETALJER, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/meldekort/infomelding`,
    () => HttpResponse.json(TEST_INFOMELDING, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/skrivemodus`,
    () => HttpResponse.json(TEST_SKRIVEMODUS, { status: 200 }),
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/hardp`,
    () => HttpResponse.json(null, { status: 200 }),
  ),

];
