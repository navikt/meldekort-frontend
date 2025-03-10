import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";
import { formaterPeriode } from "~/utils/datoUtils";

import { TEST_SPORSMAL } from "../mocks/data";


describe("SporsmalOgSvar", () => {
  afterEach(() => {
    cleanup();
  });

  const fom = new Date();

  test("Skal vise innhold med tittel", async () => {
    render(<SporsmalOgSvar sporsmal={TEST_SPORSMAL} fom={fom.toISOString()} ytelsestypePostfix={""} />);

    await sjekkeSporsmalOgSvar("sporsmal.arbeid", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.aktivitetArbeid", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.forhindret", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.ferieFravar", "diverse.nei");
  });
});

const sjekkeSporsmalOgSvar = async (sporsmal: string, svar: string, skalHaDato?: Date) => {
  const sporsmalElement = await waitFor(() => screen.queryByTestId(sporsmal));
  expect(sporsmalElement?.innerHTML).include(sporsmal);
  if (skalHaDato) expect(sporsmalElement?.innerHTML).include(formaterPeriode(skalHaDato, 14, 14));

  const svarElement = await waitFor(() => screen.queryByTestId(sporsmal + ".svar"));
  expect(svarElement?.innerHTML).include(svar);
};
