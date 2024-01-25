import type { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import type { IMeldekort } from "~/models/meldekort";
import { Innsendingstype } from "~/models/innsendingstype";
import { finnYtelsestypePostfix } from "~/utils/meldekortUtils";
import type { ISporsmalsobjekt } from "~/models/meldekortdetaljerInnsending";
import type { IMeldekortDag, ISporsmal } from "~/models/sporsmal";
import { formaterDato, formaterTid, formaterPeriode } from "~/utils/datoUtils";
import { sporsmalConfig } from "~/models/sporsmal";
import { getText } from "~/utils/intlUtils";

// Vi må samle alt vi har vist til bruker og sende sammen med meldekort for å lagre dette i Dokarkiv
// Dette brukes når vi mottar spørsmål eller klager på informasjon brukere kunne få på et eller annet tidspunkt
export function opprettSporsmalsobjekter(
  valgtMeldekort: Jsonify<IMeldekort>,
  innsendingstype: Innsendingstype,
  begrunnelse: string,
  sporsmal: ISporsmal,
  mottattDato: Date,
  nesteMeldekortKanSendes: string | undefined
): ISporsmalsobjekt[] {
  const ytelsestypePostfix = finnYtelsestypePostfix(valgtMeldekort.meldegruppe)

  const fra = valgtMeldekort.meldeperiode.fra

  const korrigering = innsendingstype === Innsendingstype.KORRIGERING

  // Oppretter et object for å samle alt vi trenger
  const sporsmalsobjekter = new Array<ISporsmalsobjekt>()

  sporsmalsobjekter.push(header(korrigering, valgtMeldekort, mottattDato, nesteMeldekortKanSendes))
  sporsmalsobjekter.push(veiledning(ytelsestypePostfix))
  sporsmalsobjekter.push(ansvar(ytelsestypePostfix))

  if (korrigering) {
    sporsmalsobjekter.push(
      korrigeringsBegrunnelse(begrunnelse, ytelsestypePostfix)
    )
  }

  sporsmalsobjekter.push(...sporsmalOgSvar(sporsmal, valgtMeldekort.meldeperiode.fra, ytelsestypePostfix))

  sporsmalsobjekter.push(uke(fra, 0, 7, sporsmal.meldekortDager, ytelsestypePostfix))
  sporsmalsobjekter.push(uke(fra, 7, 7, sporsmal.meldekortDager, ytelsestypePostfix))

  sporsmalsobjekter.push(utfylling("utfylling.arbeid", ytelsestypePostfix, true))
  sporsmalsobjekter.push(utfylling("utfylling.tiltak", ytelsestypePostfix))
  sporsmalsobjekter.push(utfylling("utfylling.syk", ytelsestypePostfix))
  sporsmalsobjekter.push(utfylling("utfylling.ferieFravar", ytelsestypePostfix))

  sporsmalsobjekter.push(bekreftelse(ytelsestypePostfix))

  return sporsmalsobjekter
}


function header(
  korrigering: boolean,
  valgtMeldekort: Jsonify<IMeldekort>,
  mottattDato: Date,
  nesteDato: string | undefined
): ISporsmalsobjekt {
  const meldekortMottatt = formaterDato(mottattDato) + " " + formaterTid(mottattDato)

  return {
    sporsmal: "",
    svar: getText(
      "sendt.mottatt.pdfheader",
      {
        type: korrigering
          ? getText("meldekort.type.korrigert").trim()
          : getText("overskrift.meldekort").trim(),
        period: formaterPeriode(valgtMeldekort.meldeperiode.fra, 0, 14),
        mottatt: meldekortMottatt,
        kortKanSendesFra: nesteDato
          ? getText("sendt.mottatt.meldekortKanSendes", { 0: formaterDato(nesteDato) }) + "<br/>"
          : "",
      }
    )
  }
}

function veiledning(ytelsestypePostfix: string): ISporsmalsobjekt {
  return {
    sporsmal: getText("sporsmal.lesVeiledning" + ytelsestypePostfix)
  }
}

function ansvar(ytelsestypePostfix: string): ISporsmalsobjekt {
  return {
    sporsmal: getText("sporsmal.ansvarForRiktigUtfylling" + ytelsestypePostfix)
  }
}

function korrigeringsBegrunnelse(
  begrunnelse: string,
  ytelsestypePostfix: string
): ISporsmalsobjekt {
  return {
    sporsmal: getText("korrigering.sporsmal.begrunnelse" + ytelsestypePostfix),
    forklaring: getText("forklaring.sporsmal.begrunnelse" + ytelsestypePostfix),
    svar: begrunnelse,
  }
}

function sporsmalOgSvar(
  sporsmal: ISporsmal,
  fra: string,
  ytelsestypePostfix: string
): ISporsmalsobjekt[] {
  return sporsmalConfig.map(spm => {
    const nestePeriode = spm.kategori === "registrert" ? " " + formaterPeriode(fra, 14, 14) : ""

    return {
      sporsmal: getText(spm.sporsmal + ytelsestypePostfix) + nestePeriode,
      forklaring: getText(spm.forklaring + ytelsestypePostfix),
      svar:
        ((sporsmal as any)[spm.id] === true ? "X " : "_ ") + getText(spm.ja + ytelsestypePostfix) +
        "<br>" +
        ((sporsmal as any)[spm.id] !== true ? "X " : "_ ") + getText(spm.nei + ytelsestypePostfix),
    }
  })
}

function uke(
  fra: string,
  plussDager: number,
  periodelengde: number,
  meldekortDager: IMeldekortDag[],
  ytelsestypePostfix: string
): ISporsmalsobjekt {
  return {
    sporsmal: getText("overskrift.uke") + formaterPeriode(fra, plussDager, periodelengde),
    svar: formaterUke(meldekortDager, plussDager, plussDager + periodelengde, ytelsestypePostfix)
  }
}

function formaterUke(dager: IMeldekortDag[], fraDag: number, tilDag: number | undefined, ytelsestypePostfix: string) {
  const ukedager = [
    getText("ukedag.mandag").trim(),
    getText("ukedag.tirsdag").trim(),
    getText("ukedag.onsdag").trim(),
    getText("ukedag.torsdag").trim(),
    getText("ukedag.fredag").trim(),
    getText("ukedag.lordag").trim(),
    getText("ukedag.sondag").trim(),
  ]

  return dager.slice(fraDag, tilDag).map((dag) => {
    const harAktivitet = dag.arbeidetTimerSum > 0 || dag.kurs || dag.annetFravaer || dag.syk
    const ukedag = dag.dag <= 7 ? ukedager[dag.dag - 1] : ukedager[dag.dag - 8]
    const aktiviteter = [
      dag.arbeidetTimerSum ? `${getText("utfylling.arbeid" + ytelsestypePostfix)} ${dag.arbeidetTimerSum} ${getText("overskrift.timer" + ytelsestypePostfix).trim()}` : "",
      dag.kurs ? getText("utfylling.tiltak" + ytelsestypePostfix).trim() : "",
      dag.syk ? getText("utfylling.syk" + ytelsestypePostfix).trim() : "",
      dag.annetFravaer ? getText("utfylling.ferieFravar" + ytelsestypePostfix).trim() : ""
    ].filter(Boolean).join(", ")

    if (harAktivitet) {
      return `<div><b>${ukedag}:</b><span> </span>${aktiviteter}</div>`
    } else {
      return ""
    }
  }).join("")
}

function utfylling(
  id: string,
  ytelsestypePostfix: string,
  medAdvarsel: boolean = false
): ISporsmalsobjekt {
  return {
    advarsel: medAdvarsel
      ? getText("sendt.advarsel" + ytelsestypePostfix)
      : "",
    sporsmal: "",
    forklaring:
      "<b>" +
      getText(id + ytelsestypePostfix) +
      "</b><br/>" +
      getText("forklaring." + id + ytelsestypePostfix)
  }
}

function bekreftelse(ytelsestypePostfix: string): ISporsmalsobjekt {
  return {
    sporsmal:
      getText("utfylling.bekreft" + ytelsestypePostfix) +
      "<br><br>X " +
      getText("utfylling.bekreftAnsvar" + ytelsestypePostfix)
  }
}
