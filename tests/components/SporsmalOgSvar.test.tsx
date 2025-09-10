import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { DateTime } from "luxon";
import { afterEach, describe, expect, test } from "vitest";

import SporsmalOgSvar from "~/components/sporsmalOgSvar/SporsmalOgSvar";

import { TEST_SPORSMAL } from "../mocks/data";


describe("SporsmalOgSvar", () => {
  afterEach(() => {
    cleanup();
  });

  const fom = DateTime.now().toISODate();

  test("Skal vise innhold med tittel", async () => {
    render(<SporsmalOgSvar sporsmal={TEST_SPORSMAL} fom={fom} ytelsestypePostfix={""} />);

    await sjekkeSporsmalOgSvar("sporsmal.arbeid", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.aktivitetArbeid", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.forhindret", "diverse.ja");
    await sjekkeSporsmalOgSvar("sporsmal.ferieFravar", "diverse.nei");
  });
});

const sjekkeSporsmalOgSvar = async (sporsmal: string, svar: string) => {
  const sporsmalElement = await waitFor(() => screen.queryByTestId(sporsmal));
  expect(sporsmalElement?.innerHTML).include(sporsmal);

  const svarElement = await waitFor(() => screen.queryByTestId(sporsmal + ".svar"));
  expect(svarElement?.innerHTML).include(svar);
};
