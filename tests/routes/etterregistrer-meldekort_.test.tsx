import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import Etterregistrering, { loader, meta } from "~/routes/etterregistrer-meldekort_";
import { jsonify, opprettTestMeldekort, TEST_PERSON } from "../mocks/data";
import { json } from "@remix-run/node";
import { screen, waitFor } from "@testing-library/react";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { beforeAndAfterSetup, renderRemixStub } from "../helpers/test-helpers";
import * as React from "react";
import { KortStatus } from "~/models/meldekort";


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

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ feil: true, person: null });
  });

  test("Skal få feil = false og person-objektet fra backend", async () => {
    const expectedPersondata = { ...TEST_PERSON }; // Clone
    jsonify(expectedPersondata);

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ feil: false, person: expectedPersondata });
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRemixStub(
      Etterregistrering,
      () => {
        return json({
          feil: true,
          person: null,
        });
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis person = null", async () => {
    renderRemixStub(
      Etterregistrering,
      () => {
        return json({
          feil: false,
          person: null,
        });
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise melding når det ikke finnes meldekort som kan sendes", async () => {
    renderRemixStub(
      Etterregistrering,
      () => {
        return json({
          feil: false,
          person: {
            etterregistrerteMeldekort: [],
          },
        });
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

    renderRemixStub(
      Etterregistrering,
      () => {
        return json({
          feil: false,
          person: {
            etterregistrerteMeldekort: [opprettTestMeldekort(1, true, KortStatus.SENDT)],
          },
        });
      },
      "/meldekort/etterregistrer-meldekort/1",
      NextComponent,
    );

    await waitFor(() => screen.findByText("NAVIGATED"));
  });

  test("Skal vise melding innhold når det fines meldekort å sende", async () => {
    renderRemixStub(
      Etterregistrering,
      () => {
        return json({
          feil: false,
          person: {
            etterregistrerteMeldekort: [opprettTestMeldekort(1), opprettTestMeldekort(2)],
          },
        });
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
