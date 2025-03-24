import { Alert, BodyLong, Box, Button, GuidePanel, Modal, Radio, RadioGroup, Select } from "@navikt/ds-react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";

import { RemixLink } from "~/components/RemixLink";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";
import type { IInfomelding } from "~/models/infomelding";
import { Innsendingstype } from "~/models/innsendingstype";
import type { ISporsmal } from "~/models/sporsmal";
import { sporsmalConfig } from "~/models/sporsmal";
import { Ytelsestype } from "~/models/ytelsestype";
import { formaterPeriode } from "~/utils/datoUtils";
import { parseHtml, useExtendedTranslation } from "~/utils/intlUtils";
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
  setActiveStep: (value: number) => void;
  infomelding: IInfomelding;
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
    setActiveStep,
    infomelding,
  } = props;

  const { i18n, tt } = useExtendedTranslation();

  const [visFeil, setVisFeil] = useState(false);

  const begrunnelseObjekt = byggBegrunnelseObjekt(tt("korriger.begrunnelse.valg"));
  const ref = useRef<HTMLDialogElement>(null);

  const setValgtBegrunnelse = (event: ChangeEvent<HTMLSelectElement>) => {
    setBegrunnelse(event.target.value);
  };

  const oppdaterSvar = (id: string, value: boolean) => {
    const tmpSporsmal = { ...sporsmal };
    tmpSporsmal[id] = value;
    setSporsmal(tmpSporsmal);
  };

  const oppdaterMeldekortDager = (value: string | boolean, index: number, spObjKey: string) => {
    const tmpSporsmal = { ...sporsmal };
    tmpSporsmal.meldekortDager[index][spObjKey] = value;
    setSporsmal(tmpSporsmal);
  };

  const validerOgVidere = (modalBekreftet: boolean = false) => {
    let feil = false;

    // Begrunnelse må velges kun ved korrigering
    if (innsendingstype === Innsendingstype.KORRIGERING && !begrunnelse) {
      feil = true;
    }

    // Sjekker at alle spørsmålene er besvart
    for (const sporsmalKey in sporsmal) {
      if (sporsmal[sporsmalKey] === null) {
        feil = true;
      }
    }

    if (feil) {
      setVisFeil(true);
      window.scrollTo(0, 600);
    } else {
      // Slett info hvis brukeren har svart Nei på det tilsvarende spørsmålet
      if (!sporsmal.arbeidet) for (let i = 0; i < 14; i++) oppdaterMeldekortDager("", i, "arbeidetTimerSum");
      if (!sporsmal.kurs) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "kurs");
      if (!sporsmal.syk) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "syk");
      if (!sporsmal.annetFravaer) for (let i = 0; i < 14; i++) oppdaterMeldekortDager(false, i, "annetFravaer");

      if (innsendingstype === Innsendingstype.INNSENDING && sporsmal.arbeidssoker === false && !modalBekreftet) {
        ref.current?.showModal();
        return;
      }

      window.scrollTo(0, 0);

      // Hvis brukeren ikke hadde noen aktivitet, hopper vi over utfylling
      if (!sporsmal.arbeidet && !sporsmal.kurs && !sporsmal.syk && !sporsmal.annetFravaer) setActiveStep(activeStep + 2);
      else setActiveStep(activeStep + 1);
    }
  };

  const nestePeriodeFormatertDato = formaterPeriode(fom, 14, 14);

  const riktigInfomelding = i18n.language === "nb" ? infomelding.norsk : infomelding.engelsk;

  return (
    <div>
      {
        riktigInfomelding &&
        <div>
          <Alert variant="info">
            {riktigInfomelding}
          </Alert>

          <Box padding="4" />
        </div>
      }

      <div>
        <Alert variant="info">
          {parseHtml(tt("sporsmal.registrertMerknad" + ytelsestypePostfix))}
        </Alert>

        <Box padding="4" />
      </div>

      {
        innsendingstype === Innsendingstype.ETTERREGISTRERING && ytelsestypePostfix === Ytelsestype.AAP &&
        <div>
          <Alert variant="info">
            {parseHtml(tt("etterregistrering.sporsmal.omVedtak"))}
          </Alert>

          <Box padding="4" />
        </div>
      }

      <GuidePanel poster>
        <Box>{parseHtml(tt("sporsmal.lesVeiledning"))}</Box>
        <Box padding="2" />
        <Box>{parseHtml(tt("sporsmal.ansvarForRiktigUtfylling"))}</Box>
      </GuidePanel>

      {
        // Man må velge bregrunnelse hvis det er KORRIGERING
        innsendingstype === Innsendingstype.KORRIGERING && <div>
          <Box padding="4" />

          <Select label={parseHtml(tt("korrigering.sporsmal.begrunnelse"))}
                  description={
                    <UtvidetInformasjon
                      innhold={parseHtml(tt("forklaring.sporsmal.begrunnelse" + ytelsestypePostfix))}
                      logText={"Viser \"Les mer\" for begrunnelse for korrigering på Spørsmål"}
                    />
                  }
                  value={begrunnelse}
                  onChange={setValgtBegrunnelse}
                  error={!begrunnelse && visFeil && tt("begrunnelse.required")}>
            <option value={""}>
              {tt("begrunnelse.velgArsak")}
            </option>
            {
              Object.keys(begrunnelseObjekt).map(key => (
                <option value={key} key={begrunnelseObjekt[key]}>
                  {begrunnelseObjekt[key]}
                </option>
              ))
            }
          </Select>
        </div>
      }

      {
        sporsmalConfig.map((item) => {
          const label = <div>
            {parseHtml(tt(item.sporsmal + ytelsestypePostfix))}
            {
              item.id === "arbeidssoker" ? <span> {nestePeriodeFormatertDato}?</span> : null
            }
          </div>;

          const desc = <UtvidetInformasjon
            innhold={parseHtml(tt(item.forklaring + ytelsestypePostfix))}
            logText={`Viser "Les mer" for ${item.id} på Spørsmål`}
          />;

          let value = hentSvar(sporsmal, item.id);
          let disabled = false;

          // Sporsmålet om å bli arbeidssøker neste periode:
          // Svaret må være JA hvis det er ETTERREGISTRERING
          // Sporsmålet må være disabled hvis det er ETTERREGISTRERING eller KORRIGERING
          // NEW: Sp. 5 må være alltid skjult etter uke 11 2025
          if (item.id === "arbeidssoker") {
            value = innsendingstype === Innsendingstype.ETTERREGISTRERING ? true : value;
            disabled = true;
          }

          return (
            <div key={item.sporsmal} style={{ display: disabled ? "none" : "" }}>
              <Box padding="4" />

              <RadioGroup
                legend={label}
                description={desc}
                value={value}
                onChange={(value: boolean) => oppdaterSvar(item.id, value)}
                disabled={disabled}
                error={visFeil && hentSvar(sporsmal, item.id) === null && tt(item.feilmeldingId + ytelsestypePostfix)}
              >
                <Radio value={true} data-testid={item.sporsmal + ".true"}>
                  {parseHtml(tt(item.ja + ytelsestypePostfix))}
                </Radio>
                <Radio value={false} data-testid={item.sporsmal + ".false"}>
                  {parseHtml(tt(item.nei + ytelsestypePostfix))}
                </Radio>
              </RadioGroup>
            </div>
          );
        })
      }

      <Modal ref={ref} header={{
        heading: tt("sporsmal.bekreft"),
        size: "small",
        closeButton: false,
      }}>
        <Modal.Body>
          <BodyLong>{parseHtml(tt("sporsmal.bekreftelse"))}</BodyLong>
          <div className="buttons">
            <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>
              {tt("sporsmal.tilbakeEndre")}
            </Button>
            <Button type="button" variant="primary" onClick={() => {
              ref.current?.close();
              validerOgVidere(true);
            }}>
              {tt("overskrift.bekreftOgFortsett")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <div className="buttons">
        <div />
        <Button variant="primary" onClick={() => validerOgVidere()}>{tt("naviger.neste")}</Button>
      </div>
      <div className="centeredButtons">
        <RemixLink as="Button" variant="tertiary" to={"/om-meldekort"}>
          {tt("naviger.avbryt")}
        </RemixLink>
      </div>
    </div>
  );
}
