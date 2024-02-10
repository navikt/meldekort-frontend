import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import {
  TEST_HISTORISKEMELDEKORT,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_MELDEKORTDETALJER,
  TEST_PERSON,
  TEST_PERSON_INFO,
  TEST_SKRIVEMODUS
} from "./data";
import { LOCAL_DECORATOR_RESPONSE } from "../../server/localData";

export const handlers = [

  http.post(
    `${TEST_MELDEKORT_API_URL}/person/meldekort`,
    () => HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, { status: 200 })
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/meldekort`,
    () => HttpResponse.json(TEST_PERSON, { status: 200 })
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/info`,
    () => HttpResponse.json(TEST_PERSON_INFO, { status: 200 })
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
    () => HttpResponse.json(TEST_HISTORISKEMELDEKORT, { status: 200 })
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/meldekort/1707156949`,
    () => HttpResponse.json(TEST_MELDEKORTDETALJER, { status: 200 })
  ),

  http.get(
    `${TEST_MELDEKORT_API_URL}/skrivemodus`,
    () => HttpResponse.json(TEST_SKRIVEMODUS, { status: 200 })
  ),

  http.get(
    `http://localhost:8080/dekorator`,
    () => new HttpResponse(LOCAL_DECORATOR_RESPONSE, { status: 200 })
  ),
];
