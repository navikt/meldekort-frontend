import { http, HttpResponse } from "msw";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { TEST_HISTORISKEMELDEKORT, TEST_MELDEKORTDETALJER, TEST_PERSON, TEST_PERSON_INFO } from "./data";

export const handlers = [

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
  )
];
