import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import Sideinnhold from "~/components/sideinnhold/Sideinnhold";


describe("Sideinnhold", () => {
  afterEach(() => {
    cleanup();
  });

  const tittel = "TITTEL";
  const innhold = "INNHOLD";
  const innholdElement = <div>{innhold}</div>;

  test("Skal vise innhold med tittel", async () => {
    render(<Sideinnhold tittel={tittel} innhold={innholdElement} />);

    await waitFor(() => screen.findByText(tittel));
    await waitFor(() => screen.findByText(innhold));
  });

  test("Skal vise innhold uten tittel", async () => {
    render(<Sideinnhold tittel={""} innhold={innholdElement} />);

    await waitFor(() => screen.findByText(innhold));
  });

  test("Skal vise innhold uten tittel når utenSideoverskrift = true", async () => {
    render(<Sideinnhold tittel={"TITTEL"} innhold={innholdElement} utenSideoverskrift={true} />);

    const tittelElement = await waitFor(() => screen.queryByText(tittel));
    expect(tittelElement).toBeNull();
    await waitFor(() => screen.findByText(innhold));
  });
});
