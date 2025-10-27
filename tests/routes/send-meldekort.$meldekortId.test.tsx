import { screen, waitFor } from "@testing-library/react";
import { DateTime } from "luxon";
import { http, HttpResponse } from "msw";
import { MetaArgs } from "react-router";
import { describe, expect, test, vi } from "vitest";

import type { IValideringsResultat } from "~/models/meldekortdetaljerInnsending";
import SendMeldekort, {
  action,
  loader,
  meta,
  shouldRevalidate,
} from "~/routes/send-meldekort.$meldekortId";

import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { beforeAndAfterSetup, renderRoutesStub } from "../helpers/test-helpers";
import {
  jsonify,
  opprettTestMeldekort,
  TEST_INFOMELDING,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL,
  TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK,
  TEST_PERSON_INFO,
} from "../mocks/data";
import { server } from "../mocks/server";

describe("Send meldekort", () => {
  vi.mock(
    "react-i18next",
    async () => (await vi.importActual("./tests/mocks/react-i18next.ts")).mock,
  );

  beforeAndAfterSetup();

  const meldekortId = "1707156945";
  const request = new Request(TEST_URL + "/send-meldekort");

  const checkLoader = async (meldekortId?: string) => {
    const response = await loader({
      request,
      params: { meldekortId },
      context: {},
    });

    expect(response).toEqual({
      feil: true,
      valgtMeldekort: undefined,
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      nesteMeldekortKanSendes: undefined,
      personInfo: null,
      infomelding: null,
    });
  };

  const checkAction = async (baksystemFeil: boolean, innsending: IValideringsResultat | null) => {
    const body = new URLSearchParams({});

    const request = new Request(TEST_URL + "/person/meldekort", {
      method: "POST",
      body,
    });

    const response = await action({
      request,
      params: {},
      context: {},
    });

    expect(response).toEqual({
      baksystemFeil,
      innsending,
    });
  };

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    await checkLoader();
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med person", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    await checkLoader(meldekortId);
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    await checkLoader(meldekortId);
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med infomelding", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/infomelding`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true }
      )
    );

    await checkLoader(meldekortId);
  });

  test("Skal få feil = false og data fra backend", async () => {
    const expectedValgtMeldekort = opprettTestMeldekort(Number(meldekortId));
    jsonify(expectedValgtMeldekort);

    const response = await loader({
      request,
      params: { meldekortId },
      context: {},
    });

    expect(response).toEqual({
      feil: false,
      valgtMeldekort: expectedValgtMeldekort,
      nesteMeldekortId: 1707156946,
      nesteEtterregistrerteMeldekortId: 1707156947,
      nesteMeldekortKanSendes: DateTime.fromMillis(1707156946 * 1000).toISODate(), // Dato fra nesteMeldekortId
      personInfo: TEST_PERSON_INFO,
      infomelding: TEST_INFOMELDING,
    });
  });

  test("nesteMeldekortKanSendes kan tas fra foersteMeldekortSomIkkeKanSendesEnna", async () => {
    const meldekort1 = opprettTestMeldekort(Number(meldekortId));
    const meldekort2 = opprettTestMeldekort(1707156946, false);

    // Svarer med valgt meldekort og et meldekort som ikke kan sendes ennå
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () =>
          HttpResponse.json({
            meldekort: [meldekort1, meldekort2],
            etterregistrerteMeldekort: [],
            id: "1",
          }),
        { once: true }
      )
    );

    jsonify(meldekort1);

    const response = await loader({
      request,
      params: { meldekortId },
      context: {},
    });

    expect(response).toEqual({
      feil: false,
      valgtMeldekort: meldekort1,
      nesteMeldekortId: undefined,
      nesteEtterregistrerteMeldekortId: undefined,
      nesteMeldekortKanSendes: DateTime.fromMillis(1707156946 * 1000).toISODate(), // Dato fra nesteMeldekortId
      personInfo: TEST_PERSON_INFO,
      infomelding: TEST_INFOMELDING,
    });
  });

  test("Skal få baksystemFeil = true når feil ved innsending av meldekort", async () => {
    server.use(
      http.post(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    await checkAction(true, null);
  });

  test("Skal få FEIL resultat ved innsending av meldekort", async () => {
    server.use(
      http.post(`${TEST_MELDEKORT_API_URL}/person/meldekort`, () =>
        HttpResponse.json(TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL, { status: 200 })
      )
    );

    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_FEIL);
  });

  test("Skal få OK resultat ved innsending av meldekort", async () => {
    await checkAction(false, TEST_MELDEKORT_VALIDERINGS_RESULTAT_OK);
  });

  test("Skal vise loader hvis tekster ikke er klare ennå", async () => {
    // IS_LOCALHOST brukes i mock for å velge hva som må returneres fra hasLoadedNamespace: true ller false
    vi.stubEnv("IS_LOCALHOST", "false");

    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: false,
        valgtMeldekort: undefined,
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: null,
        infomelding: null,
      };
    });

    await waitFor(() => screen.findByTitle("Venter..."));
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: true,
        valgtMeldekort: undefined,
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: null,
        infomelding: null,
      };
    });

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis valgtMeldekort = undefined", async () => {
    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: false,
        valgtMeldekort: undefined,
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: null,
        infomelding: null,
      };
    });

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis personInfo = null", async () => {
    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: false,
        valgtMeldekort: {
          meldeperiode: {
            fra: "",
          },
        },
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: null,
        infomelding: null,
      };
    });

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis infomelding = null", async () => {
    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: false,
        valgtMeldekort: {
          meldeperiode: {
            fra: "",
          },
        },
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: {
          personId: 1,
          fodselsnr: "01020312345",
          etternavn: "Etternavn",
          fornavn: "Fornavn",
        },
        infomelding: null,
      };
    });

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise Innsending", async () => {
    renderRoutesStub(SendMeldekort, () => {
      return {
        feil: false,
        valgtMeldekort: {
          meldeperiode: {
            fra: "2024-02-12",
            til: "2024-02-25",
          },
        },
        nesteMeldekortId: undefined,
        nesteEtterregistrerteMeldekortId: undefined,
        personInfo: {
          personId: 1,
          fodselsnr: "01020312345",
          etternavn: "Etternavn",
          fornavn: "Fornavn",
        },
        infomelding: TEST_INFOMELDING,
      };
    });

    await waitFor(() => screen.findByText("meldekort.for.perioden"));
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as MetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Send meldekort" },
    ]);
  });

  test("shouldRevalidate skal returnere false", async () => {
    expect(shouldRevalidate()).toBe(false);
  });
});
