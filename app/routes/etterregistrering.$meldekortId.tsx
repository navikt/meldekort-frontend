import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
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
import { getOboToken } from "~/utils/authUtils";
import { sendInnMeldekortAction } from "~/models/meldekortdetaljerInnsending";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Etterregistrer meldekort" },
  ]
}

export async function action(args: ActionFunctionArgs) {
  return await sendInnMeldekortAction(args)
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  let feil = false
  let person: IPerson | null = null
  let personInfo: IPersonInfo | null = null
  let valgtMeldekort: IMeldekort | undefined
  let nesteMeldekort: Number | undefined
  let nesteEtterregistrerteMeldekort: Number | undefined

  const meldekortId = params.meldekortId

  // Hvis det ikke finnes meldekortId, er det bare feil og det er ingen vits i å gjøre noe viedere
  // Ellers sjekker vi at skrivemodus er OK (true) og at vi kan hente meldekortdetaljer og finne historisk meldekort med gitt meldekortId
  if (!meldekortId) {
    feil = true
  } else {
    const onBehalfOfToken = await getOboToken(request)
    const personResponse = await hentPerson(onBehalfOfToken)
    const personInfoResponse = await hentPersonInfo(onBehalfOfToken)

    if (!personResponse.ok || !personInfoResponse.ok) {
      feil = true
    } else {
      person = await personResponse.json()
      personInfo = await personInfoResponse.json()

      valgtMeldekort = person?.etterregistrerteMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId)
      nesteMeldekort = (person?.meldekort?.length) ? person?.meldekort[0].meldekortId : undefined
      nesteEtterregistrerteMeldekort = person?.etterregistrerteMeldekort?.find(meldekort => meldekort.meldekortId.toString(10) !== meldekortId)?.meldekortId
    }
  }

  return json({
    feil,
    valgtMeldekort,
    nesteMeldekort,
    nesteEtterregistrerteMeldekort,
    personInfo,
    minSideUrl: getEnv("MIN_SIDE_URL"),
    melekortApiUrl: getEnv("MELDEKORT_API_URL")
  })
}

export default function Etterregistrering() {
  const {
    feil,
    valgtMeldekort,
    nesteMeldekort,
    nesteEtterregistrerteMeldekort,
    personInfo,
    melekortApiUrl,
    minSideUrl
  } = useLoaderData<typeof loader>()

  const fraDato = valgtMeldekort?.meldeperiode.fra || '1000-01-01'
  const { i18n, t } = useTranslation(fraDato)
  i18n.setDefaultNamespace(fraDato) // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  if (feil || !valgtMeldekort || !personInfo) {
    const innhold = <Alert variant="error">{parseHtml(t("feilmelding.baksystem"))}</Alert>

    return (
      <div>
        <MeldekortHeader />
        <Sideinnhold utenSideoverskrift={true} innhold={innhold} />
      </div>
    )
  }

  const dager = new Array<IMeldekortDag>()
  for (let i = 1; i <= 14; i++) dager.push({
    "dag": i,
    "arbeidetTimerSum": 0,
    "syk": false,
    "annetFravaer": false,
    "kurs": false,
    "meldegruppe": valgtMeldekort.meldegruppe
  })

  const sporsmal: Jsonify<ISporsmal> = {
    arbeidet: null,
    kurs: null,
    syk: null,
    annetFravaer: null,
    arbeidssoker: true, // Dette spørsmålet må besvares Ja når brukeren etterregistrerer meldekort
    signatur: true, // Vi sender ikke uten brukerens samtykke uansett
    meldekortDager: dager
  }

  return <Innsending innsendingstype={Innsendingstype.ETTERREGISTRERING}
                     valgtMeldekort={valgtMeldekort}
                     nesteMeldekort={nesteMeldekort}
                     nesteEtterregistrerteMeldekort={nesteEtterregistrerteMeldekort}
                     sporsmal={sporsmal}
                     personInfo={personInfo}
                     melekortApiUrl={melekortApiUrl}
                     minSideUrl={minSideUrl} />
}
