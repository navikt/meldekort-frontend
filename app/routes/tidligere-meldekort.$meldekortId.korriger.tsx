import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Alert } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import type { IMeldekortdetaljer } from "~/models/meldekortdetaljer";
import { hentMeldekortdetaljer } from "~/models/meldekortdetaljer";
import type { IMeldekort } from "~/models/meldekort";
import { hentHistoriskeMeldekort } from "~/models/meldekort";
import type { IPersonInfo } from "~/models/person";
import { hentPersonInfo } from "~/models/person";
import { Innsendingstype } from "~/models/innsendingstype";
import Innsending from "~/components/innsending/Innsending";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import { getOboToken } from "~/utils/authUtils";
import { sendInnMeldekortAction } from "~/models/meldekortdetaljerInnsending";
import type { IInfomelding } from "~/models/infomelding";
import { hentInfomelding } from "~/models/infomelding";
import LoaderMedPadding from "~/components/LoaderMedPadding";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Korriger tidligere meldekort" },
  ];
};

export async function action(args: ActionFunctionArgs) {
  return await sendInnMeldekortAction(args);
}

// Vi må ikke prøve å laste ned data igjen etter action
export function shouldRevalidate() {
  return false;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  let feil = false;
  let historiskeMeldekort: IMeldekort[] | null = null;
  let meldekortdetaljer: IMeldekortdetaljer | null = null;
  let personInfo: IPersonInfo | null = null;
  let infomelding: IInfomelding | null = null;
  let valgtMeldekort: IMeldekort | undefined;

  const meldekortId = params.meldekortId;

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  if (!meldekortId) {
    feil = true;
  } else {
    const onBehalfOfToken = await getOboToken(request);
    const historiskeMeldekortResponse = await hentHistoriskeMeldekort(onBehalfOfToken);
    const meldekortdetaljerResponse = await hentMeldekortdetaljer(onBehalfOfToken, meldekortId);
    const personInfoResponse = await hentPersonInfo(onBehalfOfToken);
    const infomeldingResponse = await hentInfomelding(onBehalfOfToken);

    if (!historiskeMeldekortResponse.ok || !meldekortdetaljerResponse.ok || !personInfoResponse.ok || !infomeldingResponse.ok) {
      feil = true;
    } else {
      historiskeMeldekort = await historiskeMeldekortResponse.json();
      meldekortdetaljer = await meldekortdetaljerResponse.json();
      personInfo = await personInfoResponse.json();
      infomelding = await infomeldingResponse.json();

      valgtMeldekort = historiskeMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId);

      if (valgtMeldekort?.korrigerbart !== true) {
        feil = true;
      }
    }
  }

  return json({
    feil,
    valgtMeldekort,
    meldekortdetaljer,
    personInfo,
    infomelding,
  });
}

export default function TidligereMeldekortKorrigering() {
  const {
    feil,
    valgtMeldekort,
    meldekortdetaljer,
    personInfo,
    infomelding,
  } = useLoaderData<typeof loader>();

  const fraDato = valgtMeldekort?.meldeperiode.fra || "1000-01-01";
  const { i18n, tt } = useExtendedTranslation(fraDato);
  i18n.setDefaultNamespace(fraDato); // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  // Sjekk at vi allerede har tekster, ellers vis loader
  if (!i18n.hasLoadedNamespace(fraDato)) {
    return <LoaderMedPadding />;
  }

  if (feil || !valgtMeldekort || !meldekortdetaljer || !personInfo || !infomelding) {
    const innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;

    return (
      <div>
        <MeldekortHeader />
        <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
      </div>
    );
  }

  return (
    <Innsending innsendingstype={Innsendingstype.KORRIGERING}
                valgtMeldekort={valgtMeldekort}
                sporsmal={meldekortdetaljer.sporsmal}
                personInfo={personInfo}
                infomelding={infomelding}
    />
  );
}
