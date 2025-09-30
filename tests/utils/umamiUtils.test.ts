import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Meldegruppe } from "~/models/meldegruppe";
import { loggAktivitet } from "~/utils/umamiUtils";

describe("Umami utils", () => {
  const trackMock = vi.fn();

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).umami = {
      track: trackMock,
    };
  });

  afterEach(() => {
    trackMock.mockClear();
  });

  test("Skal kalle umami.track uten data", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    loggAktivitet("test");
    expect(trackMock).toBeCalledWith(
      "test",
      {
        appNavn: "meldekort-frontend",
      },
    );
  });

  test("Skal kalle umami.track med data", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    loggAktivitet("aktivitet", { meldegruppe: Meldegruppe.DAGP, arbeidssoker: "true", innsendingstype: "type" });
    expect(trackMock).toBeCalledWith(
      "aktivitet",
      {
        appNavn: "meldekort-frontend",
        meldegruppe: Meldegruppe.DAGP,
        arbeidssoker: "true",
        innsendingstype: "type",
      },
    );
  });

  test("Skal logge error", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    const error = new Error("Test error");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).umami = {
      track: vi.fn(() => {
        throw error;
      }),
    };
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    loggAktivitet("test");

    expect(logSpy).toBeCalledWith(error);

    logSpy.mockRestore();
  });

  test("Skal ikke kalle umami.track når SKAL_LOGGE != true", async () => {
    vi.stubEnv("SKAL_LOGGE", "false");

    loggAktivitet("test");
    expect(trackMock).not.toBeCalled();
  });
});
