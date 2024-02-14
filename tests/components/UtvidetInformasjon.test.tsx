import { describe, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UtvidetInformasjon from "~/components/utvidetInformasjon/UtvidetInformasjon";


describe("UtvidetInformasjon", () => {
  test("Skal vise innhold og åpnes og lukkes", async () => {
    render(<UtvidetInformasjon innhold={<div>INNHOLD</div>} />)

    // Sjekk at det vises en lenke som brukes til å åpne info
    const linkLes = await waitFor(() => screen.findByText("veiledning.les"))

    // Klikk på lenken
    linkLes.click()

    // Sjekker at det vises innhold
    await waitFor(() => screen.findByText("INNHOLD"))

    // Sjekk at det vises en lenke som brukes til å lukke info
    const linkLukk = await waitFor(() => screen.findByText("veiledning.lukk"))

    // Klikk på lenken
    linkLukk.click()

    // Sjekk at det igjen vises en lenke som brukes til å åpne info
    await waitFor(() => screen.findByText("veiledning.les"))
  })
})
