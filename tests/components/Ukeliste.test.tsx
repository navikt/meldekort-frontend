import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Ukeliste from "~/components/ukeliste/Ukeliste";
import { TEST_MELDEKORT_DAGER } from "../mocks/data";
import { ukeFormatert } from "~/utils/datoUtils";


describe("Ukeliste", () => {
  test("Skal vise innhold for første uke", async () => {
    const fom = "2024-02-12"

    render(<Ukeliste dager={TEST_MELDEKORT_DAGER} ytelsestypePostfix={""} fom={fom} fraDag={0} tilDag={7} />)

    await waitFor(() => screen.findByText("overskrift.uke " + ukeFormatert(fom, 0)))

    await sjekkDag(1, "ukedag.mandag", "utfylling.arbeid 5 overskrift.timer")
    await sjekkDag(2, "ukedag.tirsdag", "utfylling.syk")
    await sjekkDag(3, "ukedag.onsdag", "utfylling.ferieFravar")
    await sjekkDag(4, "ukedag.torsdag", "utfylling.tiltak")
    await sjekkDag(5, "ukedag.fredag", "utfylling.tiltak, utfylling.syk")
  })

  test("Skal vise innhold for andre uke", async () => {
    const fom = "2024-02-12"

    render(<Ukeliste dager={TEST_MELDEKORT_DAGER} ytelsestypePostfix={""} fom={fom} fraDag={7} />)

    await waitFor(() => screen.findByText("overskrift.uke " + ukeFormatert(fom, 0)))

    await sjekkDag(8, "ukedag.mandag", "utfylling.arbeid 7.5 overskrift.timer")
  })
})

const sjekkDag = async (dag: number, ukedag: string, aktivitet: string) => {
  const lableElement = await waitFor(() => screen.queryByTestId("label" + dag))
  expect(lableElement?.innerHTML).include(ukedag)

  const aktivitetElement = await waitFor(() => screen.queryByTestId("aktivitet" + dag))
  expect(aktivitetElement?.innerHTML).include(aktivitet)
}
