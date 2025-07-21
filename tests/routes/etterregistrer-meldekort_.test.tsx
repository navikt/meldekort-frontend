import type { ServerRuntimeMetaArgs } from "@react-router/server-runtime/dist/routeModules";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";

import { KortStatus } from "~/models/meldekort";
import Etterregistrering, { loader, meta } from "~/routes/etterregistrer-meldekort_";

import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { beforeAndAfterSetup, renderRoutesStub } from "../helpers/test-helpers";
import { jsonify, opprettTestMeldekort, TEST_PERSON } from "../mocks/data";
import { server } from "../mocks/server";


describe("Etterregistrering", () => {
  beforeAndAfterSetup();

  const request = new Request(TEST_URL + "/etterregistrer-meldekort");

  test("Skal få feil = true og person = null når feil på backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response).toEqual({ feil: true, person: null });
  });

  test("Skal få feil = false og person-objektet fra backend", async () => {
    const expectedPersondata = { ...TEST_PERSON }; // Clone
    jsonify(expectedPersondata);

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response).toEqual({ feil: false, person: expectedPersondata });
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRoutesStub(
      Etterregistrering,
      () => {
        return {
          feil: true,
          person: null,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis person = null", async () => {
    renderRoutesStub(
      Etterregistrering,
      () => {
        return {
          feil: false,
          person: null,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise melding når det ikke finnes meldekort som kan sendes", async () => {
    renderRoutesStub(
      Etterregistrering,
      () => {
        return {
          feil: false,
          person: {
            etterregistrerteMeldekort: [],
          },
        };
      },
    );

    await waitFor(() => screen.findByText("sporsmal.ingenMeldekortASende"));
  });

  test("Skal sende brukere videre når det fines kun 1 meldekort som kan sendes", async () => {
    const NextComponent = () => {
      return (
        <div>NAVIGATED</div>
      );
    };

    renderRoutesStub(
      Etterregistrering,
      () => {
        return {
          feil: false,
          person: {
            etterregistrerteMeldekort: [opprettTestMeldekort(1, true, KortStatus.SENDT)],
          },
        };
      },
      "/etterregistrer-meldekort/1",
      NextComponent,
    );

    await waitFor(() => screen.findByText("NAVIGATED"));
  });

  test("Skal vise melding innhold når det fines meldekort å sende", async () => {
    renderRoutesStub(
      Etterregistrering,
      () => {
        return {
          feil: false,
          person: {
            etterregistrerteMeldekort: [opprettTestMeldekort(1), opprettTestMeldekort(2)],
          },
        };
      },
    );

    await waitFor(() => screen.findByText("sendMeldekort.info.kanSende"));
    await waitFor(() => screen.findByText("overskrift.periode"));
    await waitFor(() => screen.findByText("overskrift.dato"));
    await waitFor(() => screen.findByText("naviger.neste"));
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Etterregistrering" },
    ]);
  });
});
