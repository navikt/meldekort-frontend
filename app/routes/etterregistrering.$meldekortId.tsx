import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";
import type { IPerson, IPersonInfo } from "~/models/person";
import { hentPerson, hentPersonInfo } from "~/models/person";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "@remix-run/react";
import { Alert } from "@navikt/ds-react";
import { parseHtml } from "~/utils/intlUtils";
import Innsending from "~/components/innsending/Innsending";
import { Innsendingstype } from "~/models/innsendingstype";
import type { IMeldekort } from "~/models/meldekort";
import { getEnv } from "~/utils/envUtils";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekortDag, ISporsmal } from "~/models/sporsmal";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrer meldekort" },
  ]
}

export async function loader({ params }: LoaderFunctionArgs) {
  let feil = false
  let person: IPerson | null = null
  let personInfo: IPersonInfo | null = null
  let valgtMeldekort: IMeldekort | undefined

  const meldekortId = params.meldekortId

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  // Ellers sjekker vi at skrivemodus er OK (true) og at vi kan hente meldekortdetaljer og finne historisk meldekort med gitt meldekortId
  if (!meldekortId) {
    feil = true
  } else {
    const personResponse = await hentPerson()
    const personInfoResponse = await hentPersonInfo()

    if (!personResponse.ok || !personInfoResponse.ok) {
      feil = true
    } else {
      person = await personResponse.json()
      personInfo = await personInfoResponse.json()

      valgtMeldekort = person?.etterregistrerteMeldekort.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId)
    }
  }

  return json({
    feil,
    valgtMeldekort,
    personInfo,
    minSideUrl: getEnv("MIN_SIDE_URL"),
    melekortApiUrl: getEnv("MELDEKORT_API_URL")
  })
}

export default function Etterregistrering() {
  const { t } = useTranslation()

  const { feil, valgtMeldekort, personInfo, melekortApiUrl, minSideUrl } = useLoaderData<typeof loader>()

  if (feil || !valgtMeldekort || !personInfo) {
    const innhold = <Alert variant="error">{parseHtml(t("feilmelding.baksystem"))}</Alert>

    return (
      <div>
        <MeldekortHeader />
        <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
      </div>
    )
  }

  const sporsmal: Jsonify<ISporsmal> = {
    arbeidet: null,
    kurs: null,
    syk: null,
    annetFravaer: null,
    arbeidssoker: true, // Dette spørsmålet må besvares Ja når brukeren etterregistreret meldekort
    signatur: null,
    meldekortDager: new Array<Jsonify<IMeldekortDag>>()
  }

  return <Innsending innsendingstype={Innsendingstype.ETTERREGISTRERING}
                     valgtMeldekort={valgtMeldekort}
                     sporsmal={sporsmal}
                     personInfo={personInfo}
                     melekortApiUrl={melekortApiUrl}
                     minSideUrl={minSideUrl} />
}
