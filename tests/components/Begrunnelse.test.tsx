import { describe, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Begrunnelse from "~/components/begrunnelse/Begrunnelse";


describe("Begrunnelse", () => {
  test("Skal vise innhold", async () => {
    render(<Begrunnelse begrunnelse={"BEGRUNNELSE"} ytelsestypePostfix={""} />);

    await waitFor(() => screen.findByText("korrigering.sporsmal.begrunnelse"));
    await waitFor(() => screen.findByText("BEGRUNNELSE"));
  });
});
