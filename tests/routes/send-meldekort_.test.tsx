import type { ServerRuntimeMetaArgs } from "@remix-run/server-runtime/dist/routeModules";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";

import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import SendMeldekort, { loader, meta } from "~/routes/send-meldekort_";

import { TEST_MELDEKORT_API_URL, TEST_URL } from "../helpers/setup";
import { beforeAndAfterSetup, renderRemixStub } from "../helpers/test-helpers";
import { jsonify, opprettTestMeldekort, TEST_PERSON } from "../mocks/data";
import { server } from "../mocks/server";


describe("Send meldekort", () => {
  beforeAndAfterSetup();

  const request = new Request(TEST_URL + "/send-meldekort");

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
    const expectedPersondata = { ...TEST_PERSON };// Clone
    jsonify(expectedPersondata);

    const response = await loader({
      request,
      params: {},
      context: {},
    });

    expect(response).toEqual({ feil: false, person: expectedPersondata });
  });

  test("Skal vise feilmelding hvis feil = true", async () => {
    renderRemixStub(
      SendMeldekort,
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
    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: null,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));
  });

  test("Skal vise melding når det finnes meldekort som ikke kan sendes ennå", async () => {
    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: {
            meldekort: [opprettTestMeldekort(1, false)],
          },
        };
      },
    );

    await waitFor(() => screen.findByText("overskrift.nesteMeldekort"));
    await waitFor(() => screen.findByText("sendMeldekort.info.innsendingStatus.kanSendes"));
    await waitFor(() => screen.findByText("sendMeldekort.info.ingenKlare"));
  });

  test("Skal vise melding når det ikke finnes meldekort som kan sendes", async () => {
    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: {
            meldekort: [],
          },
        };
      },
    );

    await waitFor(() => screen.findByText("sporsmal.ingenMeldekortASende"));
  });

  test("Skal vise melding når det finnes for mange meldekort som kan sendes", async () => {
    const meldekort: IMeldekort[] = [];
    for (let i = 1; i <= 6; i++) meldekort.push(opprettTestMeldekort(i));

    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: {
            meldekort: meldekort,
          },
        };
      },
    );

    await waitFor(() => screen.findByText("sendMeldekort.info.forMangeMeldekort"));
    await waitFor(() => screen.findByText("sendMeldekort.info.forMangeMeldekort.feilmelding"));
  });

  test("Skal sende brukere videre når det fines kun 1 meldekort som kan sendes", async () => {
    const NextComponent = () => {
      return (
        <div>NAVIGATED</div>
      );
    };

    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: {
            meldekort: [opprettTestMeldekort(1, true, KortStatus.SENDT)],
          },
        };
      },
      "/send-meldekort/1",
      NextComponent,
    );

    await waitFor(() => screen.findByText("NAVIGATED"));
  });

  test("Skal vise meldekort som kan sendes", async () => {
    renderRemixStub(
      SendMeldekort,
      () => {
        return {
          feil: false,
          person: {
            meldekort: [opprettTestMeldekort(1), opprettTestMeldekort(2), opprettTestMeldekort(3)],
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
      { name: "description", content: "Send meldekort" },
    ]);
  });
});
