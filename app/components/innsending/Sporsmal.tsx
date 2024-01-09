import { useTranslation } from "react-i18next";
import { Box, Button, GuidePanel, Radio, RadioGroup, Select } from "@navikt/ds-react";
import { RemixLink } from "~/components/RemixLink";
import { Innsendingstype } from "~/models/innsendingstype";
import { formatHtmlMessage } from "~/utils/intlUtils";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { ISporsmal } from "~/models/sporsmal";
import { sporsmalConfig } from "~/models/sporsmal";
import { nestePeriodeFormatert } from "~/utils/datoUtils";
import { byggBegrunnelseObjekt, hentSvar } from "~/utils/miscUtils";

interface IProps {
  innsendingstype: Innsendingstype;
  fom: string;
  ytelsestypePostfix: string;
  begrunnelse: string;
  setBegrunnelse: Dispatch<SetStateAction<string>>;
  sporsmal: ISporsmal;
  setSporsmal: Dispatch<SetStateAction<ISporsmal>>;
  activeStep: number;
  setActiveStep: Function;
}

export default function Sporsmal(props: IProps) {
  const {
    innsendingstype,
    fom,
    ytelsestypePostfix,
    begrunnelse,
    setBegrunnelse,
    sporsmal,
    setSporsmal,
    activeStep,
    setActiveStep
  } = props

  const { t } = useTranslation(fom)

  const [visFeil, setVisFeil] = useState(false)

  const begrunnelseObjekt = byggBegrunnelseObjekt(t("korriger.begrunnelse.valg"))

  const setValgtBegrunnelse = (event: ChangeEvent<HTMLSelectElement>) => {
    setBegrunnelse(event.target.value)
  }

  const oppdaterSvar = (id: string, value: boolean) => {
    const tmpSporsmal: any = { ...sporsmal }
    tmpSporsmal[id] = value
    setSporsmal(tmpSporsmal)
  }

  const oppdaterMeldekortDager = (value: string | boolean, index: number, spObjKey: string) => {
    const tmpSporsmal: any = { ...sporsmal }
    tmpSporsmal.meldekortDager[index][spObjKey] = value
    setSporsmal(tmpSporsmal)
  }

  const validerOgVidere = () => {
    let feil = false

    if (innsendingstype === Innsendingstype.KORRIGERING && !begrunnelse) {
      feil = true
    }

    for (const sporsmalKey in sporsmal) {
      if ((sporsmal as any)[sporsmalKey] === null) {
        feil = true
      }
    }

    if (feil) {
      setVisFeil(true)
      document.documentElement.scrollTo(0, 600);
    } else {
      // Slett info hvis brukeren har svart Nei på det tilsvarende spørsmålet
      if (!sporsmal.arbeidet) for (let i = 0; i < 14; i++) oppdaterMeldekortDager("", i, "arbeidetTimerSum")
      if (!sporsmal.kurs) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "kurs")
      if (!sporsmal.syk) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "syk")
      if (!sporsmal.annetFravaer) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "annetFravaer")

      if (!sporsmal.arbeidet && !sporsmal.kurs && !sporsmal.syk && !sporsmal.annetFravaer) setActiveStep(activeStep + 2)
      else setActiveStep(activeStep + 1)
    }
  }

  const nestePeriodeFormatertDato = nestePeriodeFormatert(fom)

  return (
    <div>
      <GuidePanel>
        <Box>{formatHtmlMessage(t("sporsmal.lesVeiledning"))}</Box>
        <Box padding="2" />
        <Box>{formatHtmlMessage(t("sporsmal.ansvarForRiktigUtfylling"))}</Box>
      </GuidePanel>

      <Box padding="4" />

      {
        // Man må velge bregrunnelse hvis det er KORRIGERING
        innsendingstype === Innsendingstype.KORRIGERING && <div>
              <Select label={formatHtmlMessage(t("korrigering.sporsmal.begrunnelse"))}
                      description={<UtvidetInformasjon innhold={formatHtmlMessage(t("forklaring.sporsmal.begrunnelse"))} />}
                      value={begrunnelse}
                      onChange={setValgtBegrunnelse}
                      error={!begrunnelse && visFeil && t("begrunnelse.required")}>
                  <option value={""}>
                    {t("begrunnelse.velgArsak")}
                  </option>
                {
                  Object.keys(begrunnelseObjekt).map(key => (
                    <option value={key} key={(begrunnelseObjekt as any)[key]}>
                      {(begrunnelseObjekt as any)[key]}
                    </option>
                  ))
                }
              </Select>

              <Box padding="4" />
          </div>
      }

      {
        sporsmalConfig.map((item) => {
          const label = <div>
            {formatHtmlMessage(t(item.sporsmal + ytelsestypePostfix))}
            {
              item.id === "arbeidssoker" ? <span>{nestePeriodeFormatertDato}?</span> : null
            }
          </div>

          const desc = <UtvidetInformasjon innhold={formatHtmlMessage(t(item.forklaring + ytelsestypePostfix))} />

          let value = hentSvar(sporsmal, item.id)
          let disabled = false

          // Sporsmålet om å bli arbeidssøker neste periode:
          // Svaret må vare JA hvis det er ETTERREGISTRERING
          // Sporsmålet må være disabled hvis det er ETTERREGISTRERING eller KORRIGERING
          if (item.id === "arbeidssoker") {
            value = innsendingstype === Innsendingstype.ETTERREGISTRERING ? true : value
            disabled = innsendingstype === Innsendingstype.ETTERREGISTRERING || innsendingstype === Innsendingstype.KORRIGERING
          }

          return (
            <div key={item.sporsmal}>
              <RadioGroup
                legend={label}
                description={desc}
                value={value}
                onChange={(value: any) => oppdaterSvar(item.id, value)}
                disabled={disabled}
                error={visFeil && hentSvar(sporsmal, item.id) === null && t(item.feilmeldingId)}
              >
                <Radio value={true}>{formatHtmlMessage(t(item.ja + ytelsestypePostfix))}</Radio>
                <Radio value={false}>{formatHtmlMessage(t(item.nei + ytelsestypePostfix))}</Radio>
              </RadioGroup>

              <Box padding="6" />
            </div>
          )
        })
      }

      <div className="buttons">
        <div />
        <Button variant="primary" onClick={() => validerOgVidere()}>{t("naviger.neste")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to="/tidligere-meldekort">
          {t("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  )
}
