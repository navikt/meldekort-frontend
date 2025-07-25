import type { ServerRuntimeMetaArgs } from "@react-router/server-runtime/dist/routeModules";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test, vi } from "vitest";

import { KortType } from "~/models/kortType";
import { KortStatus } from "~/models/meldekort";
import Meldekortdetaljer, { loader, meta } from "~/routes/tidligere-meldekort.$meldekortId._index";

import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { beforeAndAfterSetup, renderRoutesStub } from "../helpers/test-helpers";
import { jsonify, opprettTestMeldekort, opprettTestMeldekortdetaljer, TEST_PERSON_INFO } from "../mocks/data";
import { server } from "../mocks/server";


describe("Tidligere meldekort detaljer", () => {
  vi.mock("react-i18next", async () =>
    (await vi.importActual("tests/mocks/react-i18next.ts")).mock,
  );

  beforeAndAfterSetup();

  const meldekortId = "1707156949";
  const request = new Request(TEST_URL + "/tidligere-meldekort");

  const check = async (meldekortId?: string) => {
    const response = await loader({
      request,
      params: { meldekortId },
      context: {},
    });

    expect(response).toEqual({ feil: true, valgtMeldekort: undefined, meldekortdetaljer: null, personInfo: null });
  };

  test("Skal få feil = true hvis det ikke finnes meldekortId i params", async () => {
    await check();
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med historiskemeldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    await check(meldekortId);
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med meldekortdetaljer", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/meldekort/${meldekortId}`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    await check(meldekortId);
  });

  test("Skal få feil = true hvis det finnes meldekortId i params men feil med personInfo", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/info`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    await check(meldekortId);
  });

  test("Skal få feil = false og data fra backend", async () => {
    const meldekort = opprettTestMeldekort(Number(meldekortId));
    jsonify(meldekort);

    const meldekortdetaljerData = opprettTestMeldekortdetaljer(Number(meldekortId));
    jsonify(meldekortdetaljerData);


    const response = await loader({
      request,
      params: { meldekortId: meldekortId },
      context: {},
    });

    expect(response).toEqual({
      feil: false,
      valgtMeldekort: meldekort,
      meldekortdetaljer: meldekortdetaljerData,
      personInfo: TEST_PERSON_INFO,
    });
  });

  test("Skal vise loader hvis tekster ikke er klare ennå", async () => {
    // IS_LOCALHOST brukes i mock for å velge hva som må returneres fra hasLoadedNamespace: true ller false
    vi.stubEnv("IS_LOCALHOST", "false");

    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: undefined,
          meldekortdetaljer: undefined,
        };
      },
    );

    await waitFor(() => screen.findByTitle("Venter..."));
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: true,
          valgtMeldekort: undefined,
          meldekortdetaljer: undefined,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis valgtMeldekort = undefined", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: undefined,
          meldekortdetaljer: undefined,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis meldekortdetaljer = undefined", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: opprettTestMeldekort(1),
          meldekortdetaljer: undefined,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise meldekortdetaljer uten bruttoBelop", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: opprettTestMeldekort(1),
          meldekortdetaljer: opprettTestMeldekortdetaljer(1),
          personInfo: TEST_PERSON_INFO,
        };
      },
    );

    await waitFor(() => screen.findByText("meldekort.for.perioden"));
    await waitFor(() => screen.findByText("overskrift.mottatt"));
    await waitFor(() => screen.findByText("overskrift.status"));
    await waitFor(() => screen.findByText("overskrift.bruttoBelop"));
    await waitFor(() => screen.findByText("overskrift.meldekorttype"));

    // Sjekke Skriv ut
    const spy = vi.spyOn(window, "print");
    const button = await waitFor(() => screen.findByText("overskrift.skrivUt"));
    button.click();
    expect(spy).toBeCalled();
  });

  test("Skal vise meldekortdetaljer med bruttoBelop", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: opprettTestMeldekort(1, true, KortStatus.FERDI, true, KortType.ELEKTRONISK),
          meldekortdetaljer: opprettTestMeldekortdetaljer(1),
          personInfo: TEST_PERSON_INFO,
        };
      },
    );

    await waitFor(() => screen.findByText("kr. 100,00"));
  });

  test("Skal vise begrunnelse om det finnes", async () => {
    renderRoutesStub(
      Meldekortdetaljer,
      () => {
        return {
          feil: false,
          valgtMeldekort: opprettTestMeldekort(1),
          meldekortdetaljer: opprettTestMeldekortdetaljer(1, "Test begrunnelse"),
          personInfo: TEST_PERSON_INFO,
        };
      },
    );

    await waitFor(() => screen.findByText("Test begrunnelse"));
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Tidligere meldekort detaljer" },
    ]);
  });
});
