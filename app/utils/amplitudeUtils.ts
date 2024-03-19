import * as amplitude from "@amplitude/analytics-browser";
import { getEnv } from "~/utils/envUtils";


if (typeof window !== "undefined") {
  amplitude.init(
    getEnv("AMPLITUDE_API_KEY"),
    {
      serverUrl: "https://amplitude.nav.no/collect",
      defaultTracking: false,
    },
  );
}

type AmplitudeAktivitetsData = {
  arbeidssoker?: string;
  meldegruppe: string;
  innsendingstype?: string;
}

export function loggAktivitet(aktivitet: string, data?: AmplitudeAktivitetsData) {
  try {
    if (typeof window !== "undefined") {
      const eventData = { ...data, aktivitet: aktivitet };
      amplitude.track("meldekort.aktivitet", eventData);
    }
  } catch (e) {
    console.log(e);
  }
}
