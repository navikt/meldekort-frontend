import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createRoutesStub } from "react-router";
import { describe, expect, test, vi } from "vitest";

import { KortType } from "~/models/kortType";
import { Meldegruppe } from "~/models/meldegruppe";
import { KortStatus } from "~/models/meldekort";
import App, { ErrorBoundary, IRootLoaderData, links, loader } from "~/root";

import { TEST_MELDEKORT_API_URL, TEST_URL } from "./helpers/setup";
import { beforeAndAfterSetup, renderRoutesStub } from "./helpers/test-helpers";
import {
  opprettTestMeldekort,
  TEST_DECORATOR_FRAGMENTS,
  TEST_DECORATOR_RESPONSE,
  TEST_DECORATOR_VERSION,
  TEST_PERSON_STATUS,
  TEST_SKRIVEMODUS,
} from "./mocks/data";
import { server } from "./mocks/server";


describe("Root", () => {
  vi.mock("react-i18next", async () =>
    (await vi.importActual("tests/mocks/react-i18next.ts")).mock,
  );

  beforeAndAfterSetup();

  test("Skal fortsette i felles løsningen hvis har Arena-meldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => HttpResponse.json(
          {
            meldekort: [opprettTestMeldekort(12345678, true, KortStatus.OPPRE, true, KortType.ELEKTRONISK, Meldegruppe.ATTF)],
            etterregistrerteMeldekort: [],
          },
          { status: 200 },
        ),
      ),
      http.get(
        'https://dekoratoren.ekstern.dev.nav.no/api/version',
        () => HttpResponse.json(
          TEST_DECORATOR_VERSION,
          { status: 200 },
        ),
      ),
      http.get(
        'https://dekoratoren.ekstern.dev.nav.no/ssr',
        () => HttpResponse.json(
          TEST_DECORATOR_RESPONSE,
          { status: 200 },
        ),
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).toBe(false);
  });

  test("Skal fortsette i felles løsningen hvis har etterregistrerte Arena-meldekort", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/meldekort`,
        () => HttpResponse.json(
          {
            meldekort: [],
            etterregistrerteMeldekort: [opprettTestMeldekort(12345678, true, KortStatus.OPPRE, true, KortType.ELEKTRONISK, Meldegruppe.INDIV)],
          },
          { status: 200 },
        ),
      ),
      http.get(
        'https://dekoratoren.ekstern.dev.nav.no/api/version',
        () => HttpResponse.json(
          TEST_DECORATOR_VERSION,
          { status: 200 },
        ),
      ),
      http.get(
        'https://dekoratoren.ekstern.dev.nav.no/ssr',
        () => HttpResponse.json(
          TEST_DECORATOR_RESPONSE,
          { status: 200 },
        ),
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).toBe(false);
  });

  test("Skal få feil = true når feil med harDP", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/hardp`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.feil).toEqual(true);
  });

  test("Skal sende til DP når harDP = true", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/hardp`,
        () => new HttpResponse(null, { status: 307 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as Response;

    expect(response.status).toBe(307);
  });

  test("Skal få feil = true når feil med AAP API", async () => {
    server.use(
      http.get(
        'http://meldekort-backend.aap/api/ansvarlig-system-felles',
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.feil).toEqual(true);
  });

  test("Skal sende til AAP når AAP API returnerer AAP", async () => {
    server.use(
      http.get(
        'http://meldekort-backend.aap/api/ansvarlig-system-felles',
        () => new HttpResponse('"AAP"', { status: 200 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as Response;

    expect(response.status).toBe(307);
  });

  test("Skal ikke sende til AAP når AAP API returnerer FELLES", async () => {
    server.use(
      http.get(
        'http://meldekort-backend.aap/api/ansvarlig-system-felles',
        () => new HttpResponse('"FELLES"', { status: 200 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).not.toBeNull();
    expect(response.env).not.toBeNull();
  });

  test("Skal ikke sende til AAP når AAP API returnerer feil", async () => {
    server.use(
      http.get(
        'http://meldekort-backend.aap/api/ansvarlig-system-felles',
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).not.toBeNull();
    expect(response.env).not.toBeNull();
  });

  test("Skal få feil = true når feil med TP API", async () => {
    server.use(
      http.get(
        'http://tiltakspenger-meldekort-api.tpts/brukerfrontend/bruker',
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.feil).toEqual(true);
  });

  test("Skal sende til TP når TP API returnerer true", async () => {
    server.use(
      http.get(
        'http://tiltakspenger-meldekort-api.tpts/brukerfrontend/bruker',
        () => new HttpResponse('{"harSak": true}', { status: 200 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as Response;

    expect(response.status).toBe(307);
  });

  test("Skal ikke sende til TP når TP API returnerer false", async () => {
    server.use(
      http.get(
        'http://tiltakspenger-meldekort-api.tpts/brukerfrontend/bruker',
        () => new HttpResponse('{"harSak": false}', { status: 200 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).not.toBeNull();
    expect(response.env).not.toBeNull();
  });

  test("Skal ikke sende til TP når TP API returnerer feil", async () => {
    server.use(
      http.get(
        'http://tiltakspenger-meldekort-api.tpts/brukerfrontend/bruker',
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).not.toBeNull();
    expect(response.env).not.toBeNull();
  });

  test("Skal sende til send-meldekort fra ikke-tilgang når personStatus er OK", async () => {
    const response = await loader({
      request: new Request(TEST_URL + "/ikke-tilgang"),
      params: {},
      context: {},
    }) as Response;

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/send-meldekort");
  });

  test("Skal ikke sende til ikke-tilgang når feil med personStatus", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/status`,
        () => new HttpResponse(null, { status: 500 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as IRootLoaderData;

    expect(response.fragments).not.toBeNull();
    expect(response.feil).not.toBeNull();
    expect(response.env).not.toBeNull();
  });

  test("Skal sende til ikke-tilgang når personstatus.id er tom", async () => {
    server.use(
      http.get(
        `${TEST_MELDEKORT_API_URL}/person/status`,
        () => HttpResponse.json({ id: "" }, { status: 200 }),
        { once: true },
      ),
    );

    const response = await loader({
      request: new Request(TEST_URL),
      params: {},
      context: {},
    }) as Response;

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/ikke-tilgang");
  });

  test("Skal vise loader hvis tekster ikke er klare ennå", async () => {
    // IS_LOCALHOST brukes i mock for å velge hva som må returneres fra hasLoadedNamespace: true ller false
    vi.stubEnv("IS_LOCALHOST", "false");

    renderRoutesStub(
      App,
      () => {
        return {
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: TEST_SKRIVEMODUS,
          fragments: TEST_DECORATOR_FRAGMENTS,
        };
      },
    );

    await waitFor(() => screen.findByTitle("Venter..."));
  });

  test("Skal vise feilmelding hvis feil = true (skal ikke vise Loader)", async () => {
    renderRoutesStub(
      App,
      () => {
        return {
          feil: true,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: null,
          fragments: TEST_DECORATOR_FRAGMENTS,
        };
      },
    );

    await waitFor(() => screen.findByText("feilmelding.baksystem"));


    const loader = await waitFor(() => screen.queryByTitle("Venter..."));
    expect(loader).toBeNull();
  });

  test("Skal vise innhold", async () => {
    renderRoutesStub(
      App,
      () => {
        return {
          feil: false,
          personStatus: TEST_PERSON_STATUS,
          skrivemodus: {
            skrivemodus: true,
          },
          fragments: TEST_DECORATOR_FRAGMENTS,
        };
      },
    );

    await waitFor(() => screen.findByText("DECORATOR HEADER"));
    await waitFor(() => screen.findByText("DECORATOR FOOTER"));
  });

  test("Skal vise ErrorBoundary", async () => {
    const RoutesStub = createRoutesStub([
      {
        path: "/",
        Component: App,
        loader: () => {
          throw new Error();
        },
        ErrorBoundary: ErrorBoundary,
      },
    ]);

    render(<RoutesStub />);

    await waitFor(() => screen.findByText("Feil i baksystem / System error"));
  });

  test("Skal returnere array med icon fra links()", async () => {
    expect(links().length).toBe(3);
  });
});
