import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import TidligereMeldekort, { loader, meta } from "~/routes/tidligere-meldekort_";
import { jsonify, opprettTestMeldekort, TEST_HISTORISKEMELDEKORT, TEST_SKRIVEMODUS } from "../mocks/data";
import { beforeAndAfterSetup, renderRemixStub } from "../helpers/test-helpers";
import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { screen, waitFor } from "@testing-library/react";


describe("Tidligere meldekort", () => {
  beforeAndAfterSetup();

  const request = new Request(TEST_URL + "/tidligere-meldekort");

  test("Skal få feil = true og skrivemodus = null når feil skrivemodus", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/skrivemodus`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response.feil).toEqual(true);
    expect(response.skrivemodus).toEqual(null);
  });

  test("Skal få feil = true og historiskeMeldekort = null når feil på backend", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/historiskemeldekort`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response.feil).toEqual(true);
    expect(response.historiskeMeldekort).toEqual(null);
  });

  test("Skal få feil = false og skrivemodus-objektet fra backend", async () => {
    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response.feil).toEqual(false);
    expect(response.skrivemodus).toEqual(TEST_SKRIVEMODUS);
  });

  test("Skal få feil = false og historiskeMeldekort-objektet fra backend", async () => {
    const meldekortId1 = 1707156949;
    const meldekortId2 = 1707156950;
    const historiskemeldekortData = [opprettTestMeldekort(meldekortId1), opprettTestMeldekort(meldekortId2)];
    jsonify(historiskemeldekortData);

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response.feil).toEqual(false);
    expect(response.skrivemodus).toEqual(TEST_SKRIVEMODUS);
    expect(response.historiskeMeldekort).toEqual(historiskemeldekortData);
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: true,
          skrivemodus: TEST_SKRIVEMODUS,
          historiskeMeldekort: null,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise feilmelding hvis skrivemodus er null", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: null,
          historiskeMeldekort: null,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise melding fra skrivemodus om den finnes når skrivemodus = false", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: {
            skrivemodus: false,
            melding: {
              norsk: "Norsk melding",
              engelsk: "English message",
            },
          },
          historiskeMeldekort: null,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("English message"));
  });

  test("Skal vise standard melding hvis det ikke finnes melding i skrivemodus når skrivemodus = false", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: {
            skrivemodus: false,
          },
          historiskeMeldekort: null,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("skrivemodusInfomelding"));
  });

  test("Skal vise melding om det ikke finnes meldekort hvis historiskeMeldekort = null", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: TEST_SKRIVEMODUS,
          historiskeMeldekort: null,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("tidligereMeldekort.harIngen"));
  });

  test("Skal vise melding om det ikke finnes meldekort hvis historiskeMeldekort er tom", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: TEST_SKRIVEMODUS,
          historiskeMeldekort: [],
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findByText("tidligereMeldekort.harIngen"));
  });

  test("Skal vise innhold hvis det finnes historiske meldekort", async () => {
    renderRemixStub(
      TidligereMeldekort,
      () => {
        return {
          feil: false,
          skrivemodus: TEST_SKRIVEMODUS,
          historiskeMeldekort: TEST_HISTORISKEMELDEKORT,
        };
      },
    );

    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring"));
    await waitFor(() => screen.findByText("tidligereMeldekort.forklaring.korrigering"));
    await waitFor(() => screen.findAllByText("overskrift.periode"));
  });

  test("Skal returnere metainformasjon", async () => {
    const args = {} as ServerRuntimeMetaArgs;

    expect(meta(args)).toStrictEqual([
      { title: "Meldekort" },
      { name: "description", content: "Tidligere meldekort" },
    ]);
  });
});
