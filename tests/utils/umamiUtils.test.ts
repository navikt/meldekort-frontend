import { afterEach, describe, expect, test, vi } from "vitest";

import { Meldegruppe } from "~/models/meldegruppe";
import { loggAktivitet } from "~/utils/umamiUtils";

const trackMock = vi.hoisted(() => (vi.fn()));

vi.mock("@navikt/nav-dekoratoren-moduler", async () => {
  const actualModule = await import("@navikt/nav-dekoratoren-moduler");
  return {
    ...actualModule,
    getAnalyticsInstance: vi.fn(() => trackMock),
  };
});

describe("Umami utils", () => {
  afterEach(() => {
    trackMock.mockClear();
  });

  test("Skal kalle logger uten data", async () => {
    await loggAktivitet("test");
    expect(trackMock).toHaveBeenCalledWith("test", {
      appNavn: "meldekort-frontend",
    });
  });

  test("Skal kalle logger med data", async () => {
    await loggAktivitet("aktivitet", {
      meldegruppe: Meldegruppe.DAGP,
      arbeidssoker: "true",
      innsendingstype: "type",
    });
    expect(trackMock).toHaveBeenCalledWith("aktivitet", {
      appNavn: "meldekort-frontend",
      meldegruppe: Meldegruppe.DAGP,
      arbeidssoker: "true",
      innsendingstype: "type",
    });
  });
});
