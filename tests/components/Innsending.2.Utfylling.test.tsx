import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { opprettTestMeldekort } from '../mocks/data';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import * as React from 'react';
import type { IMeldekort } from '~/models/meldekort';
import { KortStatus } from '~/models/meldekort';
import Utfylling from '~/components/innsending/2-Utfylling';
import { ukeFormatert } from '~/utils/datoUtils';
import type { IMeldekortDag } from '~/models/sporsmal';
import { KortType } from '~/models/kortType';
import { Meldegruppe } from '~/models/meldegruppe';


describe('Utfylling', () => {
  afterEach(() => {
    cleanup();
  });

  test('Skal vise innhold og feilemldinger for Meldegruppe.DAGP og Avbryt skal fungere', async () => {
    const valgtMeldekort = opprettTestMeldekort(1707696000);

    createRouteAndRender(valgtMeldekort);

    await waitFor(() => screen.findByText('overskrift.uke ' + ukeFormatert(valgtMeldekort.meldeperiode.fra, 0)));
    await waitFor(() => screen.findByText('overskrift.uke ' + ukeFormatert(valgtMeldekort.meldeperiode.fra, 7)));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('utfylling.mangler.arbeid'));
    await waitFor(() => screen.findByText('utfylling.mangler.tiltak'));
    await waitFor(() => screen.findByText('utfylling.mangler.syk'));
    await waitFor(() => screen.findByText('utfylling.mangler.ferieFravar'));

    // Sett timer "out of range"
    fireEvent.change(screen.getByTestId('arbeid1'), { target: { value: '1.7' } });
    fireEvent.change(screen.getByTestId('arbeid2'), { target: { value: '-1' } });

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('arbeidTimer.heleEllerHalveTallValidator'));
    await waitFor(() => screen.findByText('arbeidTimer.rangeValidator.range'));

    // Sett timer både ok med komma og "out of range"
    fireEvent.change(screen.getByTestId('arbeid1'), { target: { value: '5,5' } });
    fireEvent.change(screen.getByTestId('arbeid2'), { target: { value: '25' } });

    // Sett syk og fravær sammen med timer
    fireEvent.click(screen.getByTestId('syk1'));
    fireEvent.click(screen.getByTestId('annetFravaer1'));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('arbeidTimer.rangeValidator.range'));
    await waitFor(() => screen.findByText('arbeidTimer.kombinasjonSykArbeidValidator'));
    await waitFor(() => screen.findByText('arbeidTimer.kombinasjonFravaerArbeidValidator'));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.avbryt'));

    // Sjekk at vi viser AVBRUTT
    await waitFor(() => screen.findByText('AVBRUTT'));
  });

  test('Skal vise innhold og feilemldinger for Meldegruppe.ATTF', async () => {
    const valgtMeldekort = opprettTestMeldekort(
      1707696000,
      true,
      KortStatus.OPPRE,
      true,
      KortType.ELEKTRONISK,
      Meldegruppe.ATTF
    );

    createRouteAndRender(valgtMeldekort, true);

    // Sett timer
    fireEvent.change(screen.getByTestId('arbeid2'), { target: { value: '7' } });

    // Sett syk og fravær sammen med timer
    fireEvent.click(screen.getByTestId('syk2'));
    fireEvent.click(screen.getByTestId('annetFravaer2'));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('arbeidTimer.kombinasjonFravaerArbeidValidator'));
    await waitFor(() => screen.findByText('arbeidTimer.kombinasjonFravaerSykValidator'));
  });

  test('Skal vise innhold og feilemldinger for Meldegruppe.INDIV', async () => {
    const valgtMeldekort = opprettTestMeldekort(
      1707696000,
      true,
      KortStatus.OPPRE,
      true,
      KortType.ELEKTRONISK,
      Meldegruppe.INDIV
    );

    createRouteAndRender(valgtMeldekort);

    // Sett syk og fravær sammen med timer
    fireEvent.click(screen.getByTestId('syk3'));
    fireEvent.click(screen.getByTestId('annetFravaer3'));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('arbeidTimer.kombinasjonFravaerSykValidator'));
  });

  test('Skal vise innhold og feilemldinger for andre Meldegruppe', async () => {
    const valgtMeldekort = opprettTestMeldekort(
      1707696000,
      true,
      KortStatus.OPPRE,
      true,
      KortType.ELEKTRONISK,
      Meldegruppe.ARBS
    );

    createRouteAndRender(valgtMeldekort);

    // Sett syk og fravær sammen med timer
    fireEvent.change(screen.getByTestId('arbeid2'), { target: { value: '-1' } });
    fireEvent.click(screen.getByTestId('syk4'));
    fireEvent.click(screen.getByTestId('annetFravaer4'));

    // Klikk Neste
    fireEvent.click(screen.getByText('naviger.neste'));

    // Sjekk at vi viser feilmeldinger
    await waitFor(() => screen.findByText('arbeidTimer.rangeValidator.range'));
    const tittelElement = await waitFor(() => screen.queryByText('arbeidTimer.kombinasjonFravaerSykValidator'));
    expect(tittelElement).toBeNull();
  });
});

const createRouteAndRender = (
  valgtMeldekort: IMeldekort,
  medTimer: boolean = false
) => {
  const dager = new Array<IMeldekortDag>();
  for (let i = 1; i <= 14; i++) dager.push({
    'dag': i,
    'arbeidetTimerSum': medTimer ? i : 0,
    'syk': false,
    'annetFravaer': false,
    'kurs': false,
    'meldegruppe': valgtMeldekort.meldegruppe
  });

  const sporsmal = {
    arbeidet: true,
    kurs: true,
    syk: true,
    annetFravaer: true,
    arbeidssoker: true,
    signatur: true,
    meldekortDager: dager
  };

  const testRouter = createMemoryRouter([
    {
      path: '/',
      element: <Utfylling
        sporsmal={sporsmal}
        setSporsmal={() => {
        }}
        fom={valgtMeldekort.meldeperiode.fra.toISOString()}
        ytelsestypePostfix={''}
        meldegruppe={valgtMeldekort.meldegruppe}
        activeStep={1}
        setActiveStep={() => {
        }}

      />
    },
    {
      path: '/om-meldekort',
      element: <div>AVBRUTT</div>
    }
  ]);

  render(<RouterProvider router={testRouter} />);
};
