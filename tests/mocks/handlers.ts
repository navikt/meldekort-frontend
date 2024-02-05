import { HttpResponse, http } from "msw";
import { MELDEKORT_API_URL } from "../helpers/setup";
import { opprettTestMeldekort, opprettTestMeldekortdetaljer, opprettTestPerson } from "./data";

const person = opprettTestPerson()
const meldekortId1 = 1707156949
const meldekortId2 = 1707156950
const historiskemeldekortData = [opprettTestMeldekort(meldekortId1), opprettTestMeldekort(meldekortId2)]
const meldekortdetaljerData = opprettTestMeldekortdetaljer(meldekortId1)

export const handlers = [

  http.get(
    `${MELDEKORT_API_URL}/person/meldekort`,
    () => HttpResponse.json(person, { status: 200 })
  ),

  http.get(
    `${MELDEKORT_API_URL}/person/historiskemeldekort`,
    () => HttpResponse.json(historiskemeldekortData, { status: 200 })
  ),

  http.get(
    `${MELDEKORT_API_URL}/meldekort/${meldekortId1}`,
    () => HttpResponse.json(meldekortdetaljerData, { status: 200 })
  )
];
