import type { LoaderFunctionArgs, MetaFunction , ActionFunctionArgs} from "@remix-run/node";
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
import { getEnv } from "~/utils/envUtils";
import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekortDag, ISporsmal } from "~/models/sporsmal";
import { getOboToken } from "~/utils/authUtils";
import { sendInnMeldekortAction } from "~/models/meldekortdetaljerInnsending";
import { finnFoersteSomIkkeKanSendesEnna, finnNesteSomKanSendes } from "~/utils/meldekortUtils";

export const meta: MetaFunction = () => {
  return [
    { title: "Meldekort" },
    { name: "description", content: "Send meldekort" },
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
  let nesteMeldekortId: Number | undefined
  let nesteEtterregistrerteMeldekortId: Number | undefined
  let nesteMeldekortKanSendes: Date | undefined

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

      valgtMeldekort = person?.meldekort?.find(meldekort => meldekort.meldekortId.toString(10) === meldekortId)

      const nesteMeldekortSomKanSendes = finnNesteSomKanSendes(person?.meldekort, meldekortId)
      const foersteMeldekortSomIkkeKanSendesEnna = finnFoersteSomIkkeKanSendesEnna(person?.meldekort)
      const nesteEtterregistrerteMeldekort = finnNesteSomKanSendes(person?.etterregistrerteMeldekort, meldekortId)

      nesteMeldekortId = nesteMeldekortSomKanSendes?.meldekortId
      nesteEtterregistrerteMeldekortId = nesteEtterregistrerteMeldekort?.meldekortId
      nesteMeldekortKanSendes = nesteMeldekortSomKanSendes
        ? nesteMeldekortSomKanSendes.meldeperiode.kortKanSendesFra
        : foersteMeldekortSomIkkeKanSendesEnna?.meldeperiode.kortKanSendesFra
    }
  }

  return json({
    feil,
    valgtMeldekort,
    nesteMeldekortId,
    nesteEtterregistrerteMeldekortId,
    nesteMeldekortKanSendes,
    personInfo,
    minSideUrl: getEnv("MIN_SIDE_URL")
  })
}

export default function SendMeldekort() {
  const {
    feil,
    valgtMeldekort,
    nesteMeldekortId,
    nesteEtterregistrerteMeldekortId,
    nesteMeldekortKanSendes,
    personInfo,
    minSideUrl
  } = useLoaderData<typeof loader>()

  const fraDato = valgtMeldekort?.meldeperiode.fra || '1000-01-01'
  const { i18n, tt } = useExtendedTranslation(fraDato)
  i18n.setDefaultNamespace(fraDato) // Setter Default namespace slik at vi ikke må tenke om dette i alle komponenter

  if (feil || !valgtMeldekort || !personInfo) {
    const innhold = <Alert variant="error">{parseHtml(tt("feilmelding.baksystem"))}</Alert>

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
    arbeidssoker: null,
    signatur: true, // Vi sender ikke uten brukerens samtykke uansett
    meldekortDager: dager
  }

  return <Innsending innsendingstype={Innsendingstype.INNSENDING}
                     valgtMeldekort={valgtMeldekort}
                     nesteMeldekortId={nesteMeldekortId}
                     nesteEtterregistrerteMeldekortId={nesteEtterregistrerteMeldekortId}
                     nesteMeldekortKanSendes={nesteMeldekortKanSendes}
                     sporsmal={sporsmal}
                     personInfo={personInfo}
                     minSideUrl={minSideUrl} />
}
