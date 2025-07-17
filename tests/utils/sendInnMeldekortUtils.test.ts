import { http, HttpResponse } from "msw";
import { ActionFunctionArgs, AppLoadContext, Params } from "react-router";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { Innsendingstype } from "~/models/innsendingstype";
import { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { sendInnMeldekortAction } from "~/utils/sendInnMeldekortUtils";

import { catchErrorResponse } from "../helpers/response-helper";
import { TEST_MELDEKORT_API_URL } from "../helpers/setup";
import { TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK } from "../mocks/data";
import { server } from "../mocks/server";


// Kan ikke kjøres parallelt!
describe("Meldekortdetaljer Innsending", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  const opprettActionFunctionArgs = (innsendingstype: Innsendingstype = Innsendingstype.INNSENDING) => {
    const body = new FormData();
    body.append("meldekortdetaljer", "{ \"meldekortId\": \"1708156951\" }");
    body.append("innsendingstype", innsendingstype.toString());

    const request = new Request(
      "http://localhost",
      {
        method: "POST",
        body,
      },
    );
    const params: Params = {};
    const context: AppLoadContext = {};

    const actionFunctionArgs: ActionFunctionArgs = {
      request,
      params,
      context,
    };

    return actionFunctionArgs;
  };

  test("sendInnMeldekortAction skal få baksystemFeil = true når feil ved henting en ny meldekortId ved Korrigering", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/1708156951/korrigering`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs(Innsendingstype.KORRIGERING)));

    expect(response).toEqual({
      baksystemFeil: true,
      innsending: null,
    });
  });

  test("sendInnMeldekortAction skal få baksystemFeil = true når feil i backend", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()));

    expect(response).toEqual({
      baksystemFeil: true,
      innsending: null,
    });
  });

  test("sendInnMeldekortAction skal få data", async () => {
    const response = await sendInnMeldekortAction(opprettActionFunctionArgs());

    expect(response).toStrictEqual({
      baksystemFeil: false,
      innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
    });
  });

  test("sendInnMeldekortAction skal sette kortType = KORRIGERT_ELEKTRONISK og få data ved Korrigering", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        async ({ request }) => {
          const data = await request.json() as IMeldekortdetaljer
          const kortType = data.kortType
          if (kortType === "KORRIGERT_ELEKTRONISK") {
            return HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK, { status: 200 });
          } else {
            return HttpResponse.json("", { status: 500 });
          }
        }
      )
    );

    const response = await sendInnMeldekortAction(opprettActionFunctionArgs(Innsendingstype.KORRIGERING));

    expect(response).toStrictEqual({
      baksystemFeil: false,
      innsending: TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
    });
  });

  test("sendInnMeldekortAction skal få baksystemFeil = true når feil i fetch", async () => {
    // Stopper server slik at fetch kaster exception
    server.close();

    const response = await catchErrorResponse(() => sendInnMeldekortAction(opprettActionFunctionArgs()));

    expect(response).toEqual({
      baksystemFeil: true,
      innsending: null,
    });
  });

  // OBS! Ikke skriv andre tester her videre hvis du trenger fungerende server, den er allerede stoppet
});
