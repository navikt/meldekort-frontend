import amplitude from "@amplitude/analytics-browser";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Meldegruppe } from "~/models/meldegruppe";
import { loggAktivitet } from "~/utils/amplitudeUtils";


describe("Amplitude utils", () => {
  let trackSpy = vi.spyOn(amplitude, "track");
  afterEach(() => {
    trackSpy.mockClear()
  });

  test("Skal kalle amplitude.track uten data", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    trackSpy = vi.spyOn(amplitude, "track");

    loggAktivitet("test");
    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", { aktivitet: "test" });
  });

  test("Skal kalle amplitude.track med data", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    trackSpy = vi.spyOn(amplitude, "track");

    loggAktivitet("test", { meldegruppe: Meldegruppe.DAGP, arbeidssoker: "true", innsendingstype: "type" });
    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", {
      meldegruppe: Meldegruppe.DAGP,
      arbeidssoker: "true",
      innsendingstype: "type",
      aktivitet: "test",
    });
  });

  test("Skal logge error", async () => {
    vi.stubEnv("SKAL_LOGGE", "true");

    const error = new Error("Test error");
    trackSpy = vi.spyOn(amplitude, "track").mockImplementation(() => {
      throw error;
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    loggAktivitet("test");

    expect(logSpy).toBeCalledWith(error);

    logSpy.mockRestore();
  });

  test("Skal ikke kalle amplitude.track når SKAL_LOGGE != true", async () => {
    vi.stubEnv("SKAL_LOGGE", "false");

    trackSpy = vi.spyOn(amplitude, "track");

    loggAktivitet("test");
    expect(trackSpy).not.toBeCalled();
  });
});
