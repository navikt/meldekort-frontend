import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";

import MeldekorTabell from "~/components/meldekortTabell/MeldekortTabell";
import { KortType } from "~/models/kortType";
import type { IMeldekort } from "~/models/meldekort";
import { KortStatus } from "~/models/meldekort";
import { formaterDato, formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/datoUtils";
import { mapKortStatusTilTekst } from "~/utils/meldekortUtils";

import { jsonify, opprettTestMeldekort } from "../mocks/data";


describe("MeldekorTabell", () => {
  test("Skal vise innhold", async () => {
    const meldekort1 = opprettTestMeldekort(1, false, KortStatus.FERDI, true);
    const meldekort2 = opprettTestMeldekort(2, false, KortStatus.FERDI, true, KortType.KORRIGERT_ELEKTRONISK);
    const meldekort3 = opprettTestMeldekort(3, true, KortStatus.KAND, true, KortType.KORRIGERT_ELEKTRONISK);
    const meldekort4 = opprettTestMeldekort(4, true, KortStatus.IKKE, true, KortType.KORRIGERT_ELEKTRONISK);
    const meldekortListe = [meldekort1, meldekort2, meldekort3, meldekort4];
    jsonify(meldekortListe);

    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <MeldekorTabell meldekortListe={(meldekortListe as unknown) as IMeldekort[]} />,
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    await waitFor(() => screen.findAllByText("overskrift.periode"));
    await waitFor(() => screen.findAllByText("overskrift.dato"));
    await waitFor(() => screen.findAllByText("overskrift.mottatt"));
    await waitFor(() => screen.findAllByText("overskrift.status"));
    await waitFor(() => screen.findAllByText("overskrift.bruttoBelop"));

    await sjekkMeldekortRad(meldekort1, true);
    await sjekkMeldekortRad(meldekort2, true);
    await sjekkMeldekortRad(meldekort3);
    await sjekkMeldekortRad(meldekort4);
  });
});

const sjekkMeldekortRad = async (meldekort: IMeldekort, medBruttobelop: boolean = false) => {
  const periode = meldekort.meldeperiode;

  const rad = await waitFor(() => screen.queryByTestId(meldekort.meldekortId));
  expect(rad?.innerHTML).include("/tidligere-meldekort/" + meldekort.meldekortId);
  expect(rad?.innerHTML).include("overskrift.uke " + formaterPeriodeTilUkenummer(periode.fra, periode.til));
  expect(rad?.innerHTML).include(formaterPeriodeDato(periode.fra, periode.til));
  expect(rad?.innerHTML).include(formaterDato(meldekort.mottattDato));
  expect(rad?.innerHTML).include(mapKortStatusTilTekst(meldekort.kortStatus, meldekort.kortType));
  if (medBruttobelop) expect(rad?.innerHTML).include("kr. 100,00");
  else expect(rad?.innerHTML).not.include("kr. 100,00");
};
