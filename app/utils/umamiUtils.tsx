import { getAnalyticsInstance } from "@navikt/nav-dekoratoren-moduler";

type AktivitetsData = {
  arbeidssoker?: string;
  meldegruppe: string;
  innsendingstype?: string;
};

const logger = getAnalyticsInstance("meldekort-frontend");

export async function loggAktivitet(aktivitet: string, data?: AktivitetsData) {
  if (typeof window === "undefined") return;

  try {
    const eventData = { appNavn: "meldekort-frontend", ...data };

    await logger(aktivitet, eventData);
  } catch (e) {
    console.error(e);
  }
}
