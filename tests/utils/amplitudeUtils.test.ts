import { describe, expect, test, vi } from "vitest";
import amplitude from '@amplitude/analytics-browser';
import { loggAktivitet } from "~/utils/amplitudeUtils";
import { Meldegruppe } from "~/models/meldegruppe";


describe("Amplitude utils", () => {
  test("Skal kalle amplitude.track uten data", async () => {

    const trackSpy = vi.spyOn(amplitude, "track");

    loggAktivitet("test");
    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", { aktivitet: "test" });
  });

  test("Skal kalle amplitude.track med data", async () => {
    const trackSpy = vi.spyOn(amplitude, "track");

    loggAktivitet("test", { meldegruppe: Meldegruppe.DAGP, arbeidssoker: "true", innsendingstype: "type" });
    expect(trackSpy).toBeCalledWith("meldekort.aktivitet", {
      meldegruppe: Meldegruppe.DAGP,
      arbeidssoker: "true",
      innsendingstype: "type",
      aktivitet: "test"
    });
  });

  test("Skal logge error", async () => {
    const error = new Error("Test error");
    vi.spyOn(amplitude, "track").mockImplementation(() => {
      throw error;
    });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    loggAktivitet("test");

    expect(logSpy).toBeCalledWith(error);

    logSpy.mockRestore();
  });
});
