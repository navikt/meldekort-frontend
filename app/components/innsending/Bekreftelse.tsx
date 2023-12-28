import { useTranslation } from "react-i18next";
import { Alert, Box, Button, ConfirmationPanel } from "@navikt/ds-react";
import { formatHtmlMessage } from "~/utils/intlUtils";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";
import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import { RemixLink } from "~/components/RemixLink";
import type { ISporsmal } from "~/models/sporsmal";
import { useState } from "react";

interface IProps {
  begrunnelse: string;
  sporsmal: ISporsmal;
  fom: string;
  ytelsestypePostfix: string;
  forrigeOnclickHandler: Function;
  nesteOnclickHandler: Function;
}

export default function Bekreftelse(props: IProps) {
  const { begrunnelse, sporsmal, fom, ytelsestypePostfix, forrigeOnclickHandler, nesteOnclickHandler } = props

  const { t } = useTranslation(fom)

  const [bekreftet, setBekreftet] = useState(false)
  const [visFeil, setVisFeil] = useState(false)

  const valider = () => {
    if (!bekreftet) {
      setVisFeil(true)
    } else {
      nesteOnclickHandler()
    }
  }

  return (
    <div>
      <Alert variant="warning">
        {formatHtmlMessage(t("overskrift.steg3.info.ikkeSendt"))}
        {formatHtmlMessage(t("overskrift.steg3.info.bekreftVerdier"))}
      </Alert>

      <Box padding="4" />

      <Begrunnelse begrunnelse={begrunnelse} />

      <SporsmalOgSvar sporsmal={sporsmal} fom={fom} ytelsestypePostfix={ytelsestypePostfix} />

      <hr />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={0} tilDag={7} />

      <Ukeliste dager={sporsmal.meldekortDager} ytelsestypePostfix={ytelsestypePostfix} fom={fom} fraDag={7} />

      <ConfirmationPanel
        label={t("utfylling.bekreftAnsvar")}
        checked={bekreftet}
        onChange={() => setBekreftet((bekreftet) => !bekreftet)}
        error={!bekreftet && visFeil && t("utfylling.bekreft.feil")}
      >
        {formatHtmlMessage(t("utfylling.bekreft"))}
      </ConfirmationPanel>

      <Box padding="6" />

      <div className="buttons">
        <Button variant="secondary" onClick={() => forrigeOnclickHandler()}>{t("naviger.forrige")}</Button>
        <Button variant="primary" onClick={() => valider()}>{t("naviger.send")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to="/tidligere-meldekort">
          {t("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  )
}
