import type { MockInstance } from 'vitest';
import { describe, expect, test, vi } from 'vitest';
import { opprettSporsmalsobjekter } from '~/utils/sporsmalsobjekterUtils';
import { Innsendingstype } from '~/models/innsendingstype';
import { opprettTestMeldekort, TEST_SPORSMAL } from '../mocks/data';
import type { Jsonify } from '@remix-run/server-runtime/dist/jsonify';
import type { IMeldekort } from '~/models/meldekort';
import { formaterDato, formaterPeriode, formaterTid, ukeFormatert } from '~/utils/datoUtils';
import i18next from 'i18next';


describe('Sporsmalsobjekter utils', () => {
  const valgtMeldekort = opprettTestMeldekort(1707156945);
  const begrunnelse = 'Begrunnelse';
  const mottattDato = new Date();
  const nesteMeldekortKanSendes = '09.02.2024';

  test('opprettSporsmalsobjekter skal returnere riktige objekter for INNSENDING', async () => {
    const tSpy: MockInstance = vi.spyOn(i18next, 't');
    tSpy.mockImplementation((keys: string[]) => {
      if (keys[0] === 'sendt.mottatt.pdfheader') return '{type} {period} {mottatt} {kortKanSendesFra}';
      if (keys[0] === 'sendt.mottatt.meldekortKanSendes') return '{0}';
      else return keys[0];
    });

    const result = opprettSporsmalsobjekter(
      (valgtMeldekort as unknown) as Jsonify<IMeldekort>,
      Innsendingstype.INNSENDING,
      begrunnelse,
      TEST_SPORSMAL,
      mottattDato,
      nesteMeldekortKanSendes
    );

    expect(result.length).toBe(15);

    // Header
    expect(result[0]).toStrictEqual({
      sporsmal: '',
      svar: 'overskrift.meldekort overskrift.uke '
        + formaterPeriode(valgtMeldekort.meldeperiode.fra, 0, 14)
        + ' '
        + formaterDato(mottattDato)
        + ' '
        + formaterTid(mottattDato)
        + ' '
        + formaterDato(nesteMeldekortKanSendes)
        + '<br/>'
    });

    // Veiledning
    expect(result[1]).toStrictEqual({
      sporsmal: 'sporsmal.lesVeiledning'
    });

    // Ansvar
    expect(result[2]).toStrictEqual({
      sporsmal: 'sporsmal.ansvarForRiktigUtfylling'
    });

    // Spørsmål og svar
    expect(result[3]).toStrictEqual({
      sporsmal: 'sporsmal.arbeid',
      forklaring: 'forklaring.sporsmal.arbeid',
      svar: 'X svar.arbeid.ja<br>_ svar.arbeid.nei'
    });
    expect(result[4]).toStrictEqual({
      sporsmal: 'sporsmal.aktivitetArbeid',
      forklaring: 'forklaring.sporsmal.aktivitetArbeid',
      svar: 'X svar.aktivitetArbeid.ja<br>_ svar.aktivitetArbeid.nei'
    });
    expect(result[5]).toStrictEqual({
      sporsmal: 'sporsmal.forhindret',
      forklaring: 'forklaring.sporsmal.forhindret',
      svar: 'X svar.forhindret.ja<br>_ svar.forhindret.nei'
    });
    expect(result[6]).toStrictEqual({
      sporsmal: 'sporsmal.ferieFravar',
      forklaring: 'forklaring.sporsmal.ferieFravar',
      svar: '_ svar.ferieFravar.ja<br>X svar.ferieFravar.nei'
    });
    expect(result[7]).toStrictEqual({
      sporsmal: 'sporsmal.registrert ' + formaterPeriode(valgtMeldekort.meldeperiode.fra, 14, 14),
      forklaring: 'forklaring.sporsmal.registrert',
      svar: 'X svar.registrert.ja<br>_ svar.registrert.nei'
    });

    // Aktiviteter
    expect(result[8]).toStrictEqual({
      sporsmal: 'overskrift.uke ' + ukeFormatert(valgtMeldekort.meldeperiode.fra, 0),
      svar: '<div><b>ukedag.mandag:</b><span> </span>utfylling.arbeid 5 overskrift.timer</div>' +
        '<div><b>ukedag.tirsdag:</b><span> </span>utfylling.syk</div>' +
        '<div><b>ukedag.onsdag:</b><span> </span>utfylling.ferieFravar</div' +
        '><div><b>ukedag.torsdag:</b><span> </span>utfylling.tiltak</div>' +
        '<div><b>ukedag.fredag:</b><span> </span>utfylling.tiltak, utfylling.syk</div>'
    });
    expect(result[9]).toStrictEqual({
      sporsmal: 'overskrift.uke ' + ukeFormatert(valgtMeldekort.meldeperiode.fra, 7),
      svar: '<div><b>ukedag.mandag:</b><span> </span>utfylling.arbeid 7.5 overskrift.timer</div>'
    });

    // Forklaring
    expect(result[10]).toStrictEqual({
      advarsel: 'sendt.advarsel',
      sporsmal: '',
      forklaring: '<b>utfylling.arbeid</b><br/>forklaring.utfylling.arbeid'
    });
    expect(result[11]).toStrictEqual({
      advarsel: '',
      sporsmal: '',
      forklaring: '<b>utfylling.tiltak</b><br/>forklaring.utfylling.tiltak'
    });
    expect(result[12]).toStrictEqual({
      advarsel: '',
      sporsmal: '',
      forklaring: '<b>utfylling.syk</b><br/>forklaring.utfylling.syk'
    });
    expect(result[13]).toStrictEqual({
      advarsel: '',
      sporsmal: '',
      forklaring: '<b>utfylling.ferieFravar</b><br/>forklaring.utfylling.ferieFravar'
    });

    // Bekreftelse
    expect(result[14]).toStrictEqual({
      sporsmal: 'utfylling.bekreft<br><br>X utfylling.bekreftAnsvar'
    });
  });

  test('opprettSporsmalsobjekter skal returnere riktige objekter for KORRIGERING', async () => {
    const result = opprettSporsmalsobjekter(
      (valgtMeldekort as unknown) as Jsonify<IMeldekort>,
      Innsendingstype.KORRIGERING,
      begrunnelse,
      TEST_SPORSMAL,
      mottattDato,
      undefined
    );

    // Begrunnelse for korrigering
    expect(result[3]).toStrictEqual({
      sporsmal: 'korrigering.sporsmal.begrunnelse',
      forklaring: 'forklaring.sporsmal.begrunnelse',
      svar: begrunnelse,
    });

    expect(result.length).toBe(16);
  });
});
