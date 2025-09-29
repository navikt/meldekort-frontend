import { Alert, Box, Button, Checkbox, CheckboxGroup } from "@navikt/ds-react";
import { AkselLegacyBackgroundColorToken, AkselLegacyBorderColorToken } from "@navikt/ds-tokens/types";
import { DateTime } from "luxon";
import { useState } from "react";

import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import { ReactLink } from "~/components/ReactLink";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import { Innsendingstype } from "~/models/innsendingstype";
import type { IMeldekort } from "~/models/meldekort";
import type {
  IFravaerInnsending,
  IMeldekortdetaljerInnsending,
  ISendInnMeldekortActionResponse,
} from "~/models/meldekortdetaljerInnsending";
import { FravaerTypeInnsending } from "~/models/meldekortdetaljerInnsending";
import type { ISporsmal } from "~/models/sporsmal";
import { loggAktivitet } from "~/utils/amplitudeUtils";
import { useFetcherWithPromise } from "~/utils/fetchUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import { opprettSporsmalsobjekter } from "~/utils/sporsmalsobjekterUtils";


interface IProps {
  begrunnelse: string;
  sporsmal: ISporsmal;
  valgtMeldekort: IMeldekort;
  innsendingstype: Innsendingstype;
  activeStep: number;
  setActiveStep: (value: number) => void;
  nesteMeldekortKanSendes: string | undefined;
}

export default function Bekreftelse(props: IProps) {
  const {
    begrunnelse,
    sporsmal,
    valgtMeldekort,
    innsendingstype,
    activeStep,
    setActiveStep,
    nesteMeldekortKanSendes,
  } = props;

  const { tt } = useExtendedTranslation();

  const fetcher = useFetcherWithPromise<ISendInnMeldekortActionResponse>({ key: "sendInnMeldekort" });

  const [bekreftet, setBekreftet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visFeil, setVisFeil] = useState(false);
  const [baksystemFeil, setBaksystemFeil] = useState(false);

  const fom = valgtMeldekort.meldeperiode.fra;
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe);

  const hentFravaersdager = () => {
    const fravar: IFravaerInnsending[] = [];
    sporsmal.meldekortDager.forEach(meldekortDag => {
      if (Number(meldekortDag.arbeidetTimerSum) > 0) {
        fravar.push({
          dagIndeks: meldekortDag.dag - 1,
          type: { typeFravaer: FravaerTypeInnsending.ARBEIDS_FRAVAER },
          arbeidTimer: meldekortDag.arbeidetTimerSum,
        });
      }

      if (meldekortDag.syk) {
        fravar.push({
          dagIndeks: meldekortDag.dag - 1,
          type: { typeFravaer: FravaerTypeInnsending.SYKDOM },
        });
      }

      if (meldekortDag.kurs) {
        fravar.push({
          dagIndeks: meldekortDag.dag - 1,
          type: { typeFravaer: FravaerTypeInnsending.KURS_UTDANNING },
        });
      }

      if (meldekortDag.annetFravaer) {
        fravar.push({
          dagIndeks: meldekortDag.dag - 1,
          type: { typeFravaer: FravaerTypeInnsending.ANNET_FRAVAER },
        });
      }
    });
    return fravar;
  };

  const tilbake = () => {
    window.scrollTo(0, 0);

    if (!sporsmal.arbeidet && !sporsmal.kurs && !sporsmal.syk && !sporsmal.annetFravaer) setActiveStep(activeStep - 2);
    else setActiveStep(activeStep - 1);
  };

  const validerOgVidere = () => {
    if (!bekreftet) {
      setVisFeil(true);
    } else {
      // Send
      setLoading(true);

      const mottattDato = DateTime.now().setZone("Europe/Oslo")

      const meldekortdetaljer: IMeldekortdetaljerInnsending = {
        begrunnelse: begrunnelse,
        erArbeidssokerNestePeriode: !!sporsmal.arbeidssoker,
        fravaersdager: hentFravaersdager(),
        korrigerbart: innsendingstype !== Innsendingstype.KORRIGERING,
        kortStatus: valgtMeldekort.kortStatus,
        kortType: valgtMeldekort.kortType,
        meldegruppe: valgtMeldekort.meldegruppe,
        meldekortId: valgtMeldekort.meldekortId,
        meldeperiode: valgtMeldekort.meldeperiode,
        mottattDato: mottattDato.toISODate()!,
        sesjonsId: "IKKE I BRUK",
        signatur: true, // Vi sender ikke uten brukerens samtykke
        sporsmalsobjekter: opprettSporsmalsobjekter(valgtMeldekort, innsendingstype, begrunnelse, sporsmal, mottattDato, nesteMeldekortKanSendes), // Her samler vi alt bruker har sett for å lagre i Dokarkiv
      };

      const formData = new FormData();
      formData.append("meldekortdetaljer", JSON.stringify(meldekortdetaljer));
      formData.append("innsendingstype", innsendingstype.toString());
      fetcher.submit(formData, { method: "post" }).then((data) => {
          setLoading(false);

          // Vi skal være her på denne siden og vise en feilmelding hvis data.baksystemFeil = true eller hvis det ikke finnes data.innsending.status
          if (data?.baksystemFeil || !data?.innsending || !data.innsending.status) {
            setBaksystemFeil(true);
            return;
          }

          // Skroll opp
          // Gå videre til Kvittering hvis status er OK
          // Gå tilbake til Utfylling (og vis feilmeldinger der) hvis status er FEIL
          window.scrollTo(0, 0);
          const status = data.innsending.status;
          if (status === "OK") {
            setActiveStep(activeStep + 1);
          } else if (status === "FEIL") {
            setActiveStep(activeStep - 1);
          } else {
            // Uforventet status
            setBaksystemFeil(true);
            return;
          }
        },
      );
    }
  };

  loggAktivitet("Viser bekreftelse");

  let bekreftelseBackground = "surface-warning-subtle";
  let bekreftelseBorderColor = "border-warning";

  if (!bekreftet && visFeil) {
    bekreftelseBackground = "surface-danger-subtle";
    bekreftelseBorderColor = "border-danger";
  }
  if (bekreftet) {
    bekreftelseBackground = "surface-success-subtle";
    bekreftelseBorderColor = "border-success";
  }

  return (
    <div>
      <Alert variant="warning">
        {parseHtml(tt("overskrift.steg3.info.ikkeSendt"))}
        {parseHtml(tt("overskrift.steg3.info.bekreftVerdier"))}
      </Alert>

      <Box padding="4" />

      {
        innsendingstype === Innsendingstype.KORRIGERING &&
        <Begrunnelse begrunnelse={begrunnelse} ytelsestypePostfix={ytelsestypePostfix} />
      }

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0}
                tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <Box
        background={ bekreftelseBackground as AkselLegacyBackgroundColorToken }
        borderColor={ bekreftelseBorderColor as AkselLegacyBorderColorToken }
        padding="space-16"
        borderWidth="1"
        borderRadius="medium"
      >
        <CheckboxGroup
          legend={parseHtml(tt("utfylling.bekreft" + ytelsestypePostfix))}
          onChange={() => setBekreftet((bekreftet) => !bekreftet)}
          error={!bekreftet && visFeil && tt("utfylling.bekreft.feil")}
        >
          <Checkbox value="" checked={bekreftet}>{tt("utfylling.bekreftAnsvar")}</Checkbox>
        </CheckboxGroup>
      </Box>

      {baksystemFeil &&
        <div>
          <Box padding="4" />

          <Alert variant="error">
            {parseHtml(tt("meldekortkontroll.feilkode.00"))}
          </Alert>
        </div>
      }

      <div className="buttons">
        <Button variant="secondary" onClick={() => tilbake()}>{tt("naviger.forrige")}</Button>
        <Button variant="primary" loading={loading} onClick={() => validerOgVidere()}>{tt("naviger.send")}</Button>
      </div>
      <div className="centeredButtons">
        <ReactLink as="Button" variant="tertiary" to={"/om-meldekort"}>
          {tt("naviger.avbryt")}
        </ReactLink>
      </div>
    </div>
  );
}
