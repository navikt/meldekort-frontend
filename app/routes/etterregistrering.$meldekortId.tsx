import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import type { IPerson, IPersonInfo } from "~/models/person";
import { hentPerson, hentPersonInfo } from "~/models/person";
import { useLoaderData } from "@remix-run/react";
import { Alert } from "@navikt/ds-react";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import Innsending from "~/components/innsending/Innsending";
import { Innsendingstype } from "~/models/innsendingstype";
import type { IMeldekort } from "~/models/meldekort";
import { getOboToken } from "~/utils/authUtils";
import { sendInnMeldekortAction } from "~/models/meldekortdetaljerInnsending";
import { finnNesteSomKanSendes } from "~/utils/meldekortUtils";
import { opprettSporsmal } from "~/utils/miscUtils";
import type { IInfomelding } from "~/models/infomelding";
import { hentInfomelding } from "~/models/infomelding";


export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrer meldekort" }
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
  let person: IPerson | null = null;
  let personInfo: IPersonInfo | null = null;
  let infomelding: IInfomelding | null = null;
  let valgtMeldekort: IMeldekort | undefined;
  let nesteMeldekortId: Number | undefined;
  let nesteEtterregistrerteMeldekortId: Number | undefined;

  const meldekortId = params.meldekortId;

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  if (!meldekortId) {
    feil = true;
  } else {
    const onBehalfOfToken = await getOboToken(request);
    const personResponse = await hentPerson(onBehalfOfToken);
    const personInfoResponse = await hentPersonInfo(onBehalfOfToken);
    const infomeldingResponse = await hentInfomelding(onBehalfOfToken);

    if (!personResponse.ok || !personInfoResponse.ok || !infomeldingResponse.ok) {
      feil = true;
    } else {
      person = await personResponse.json();
      personInfo = await personInfoResponse.json();
      infomelding = await infomeldingResponse.json();

      valgtMeldekort = person?.etterregistrerteMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId);
      nesteMeldekortId = finnNesteSomKanSendes(person?.meldekort, meldekortId)?.meldekortId;
      nesteEtterregistrerteMeldekortId = finnNesteSomKanSendes(person?.etterregistrerteMeldekort, meldekortId)?.meldekortId;
    }
  }

  return json({
    feil,
    valgtMeldekort,
    nesteMeldekortId,
    nesteEtterregistrerteMeldekortId,
    personInfo,
    infomelding
  });
}

export default function EtterregistreringMeldekort() {
  const {
    feil,
    valgtMeldekort,
    nesteMeldekortId,
    nesteEtterregistrerteMeldekortId,
    personInfo,
    infomelding
  } = useLoaderData<typeof loader>();

  const fraDato = valgtMeldekort?.meldeperiode.fra || "1000-01-01";
  const { i18n, tt } = useExtendedTranslation(fraDato);
  i18n.setDefaultNamespace(fraDato); // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  if (feil || !valgtMeldekort || !personInfo || !infomelding) {
    const innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>;

    return (
      <div>
        <MeldekortHeader />
        <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
      </div>
    );
  }

  return (
    <Innsending innsendingstype={Innsendingstype.ETTERREGISTRERING}
                valgtMeldekort={valgtMeldekort}
                nesteMeldekortId={nesteMeldekortId}
                nesteEtterregistrerteMeldekortId={nesteEtterregistrerteMeldekortId}
                sporsmal={opprettSporsmal(valgtMeldekort.meldegruppe, true)}
                personInfo={personInfo}
                infomelding={infomelding}
    />
  );
}
