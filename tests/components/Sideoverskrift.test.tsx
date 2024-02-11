import { describe, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Sideoverskrift from "~/components/sideoverskrift/Sideoverskrift";

describe("Sideoverskrift", () => {
  test("Skal vise innhold", async () => {
    render(<Sideoverskrift tittel={"TITTEL"} />)

    await waitFor(() => screen.findByText("TITTEL"))
  })
})
