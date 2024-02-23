import { describe, expect, test } from 'vitest';
import { byggBegrunnelseObjekt, formaterBelop, hentSvar, ukeDager } from '~/utils/miscUtils';
import type { IMeldekortDag, ISporsmal } from '~/models/sporsmal';


describe('Misc utils', () => {
  test('formaterBelop skal fungere uten arg', () => {
    const result = formaterBelop();

    expect(result).toBe('kr. 0');
  });

  test('formaterBelop skal fungere med undefined', () => {
    const result = formaterBelop(undefined);

    expect(result).toBe('kr. 0');
  });

  test('formaterBelop skal fungere med 0', () => {
    const result = formaterBelop(0);

    expect(result).toBe('kr. 0');
  });

  test('formaterBelop skal fungere med 1-999', () => {
    for (let i = 1; i <= 999; i++) {
      const result = formaterBelop(i);

      expect(result).toBe(`kr. ${i},00`);
    }
  });

  test('formaterBelop skal fungere med 1000-99000', () => {
    for (let i = 1; i <= 99; i++) {
      const result = formaterBelop(i * 1000);

      expect(result).toBe(`kr. ${i} 000,00`);
    }
  });

  test('formaterBelop skal fungere med desimaler', () => {
    const result = formaterBelop(123.451);

      expect(result).toBe('kr. 123,45');
  });

  test('byggBegrunnelseObjekt skal fungere med dårlig JSON', () => {
    const result = byggBegrunnelseObjekt('TEST');

    expect(result).toStrictEqual({});
  });

  test('byggBegrunnelseObjekt skal fungere med OK JSON', () => {
    const result = byggBegrunnelseObjekt('{"1": "Feil i antall arbeidstimer","2": "Glemt å registrere aktivitet"}');

    expect(result).toStrictEqual({ '1': 'Feil i antall arbeidstimer', '2': 'Glemt å registrere aktivitet' });
  });

  test('hentSvar skal hente svar', () => {
    const sporsmal: ISporsmal = {
      arbeidssoker: true,
      arbeidet: false,
      syk: null,
      annetFravaer: null,
      kurs: null,
      signatur: null,
      meldekortDager: new Array<IMeldekortDag>()
    };
    let result = hentSvar(sporsmal, 'arbeidssoker');
    expect(result).toBe(true);

    result = hentSvar(sporsmal, 'arbeidet');
    expect(result).toBe(false);

    result = hentSvar(sporsmal, 'syk');
    expect(result).toBe(null);

    result = hentSvar(sporsmal, 'feil');
    expect(result).toBe(null);
  });

  test('ukeDager skal returnere array', () => {
    const result = ukeDager();
    expect(result).toStrictEqual([
      'ukedag.mandag',
      'ukedag.tirsdag',
      'ukedag.onsdag',
      'ukedag.torsdag',
      'ukedag.fredag',
      'ukedag.lordag',
      'ukedag.sondag'
    ]);
  });
});
