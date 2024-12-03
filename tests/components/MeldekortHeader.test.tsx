import { afterEach, describe, expect, test } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import MeldekortHeader from "~/components/meldekortHeader/MeldekortHeader";


describe("MeldekortHeader", () => {
  afterEach(() => {
    cleanup();
  });

  test("Skal vise overskrift og åpne meny når bruker klikker på mobileMenu", async () => {
    const testRouter = createMemoryRouter([
      {
        path: "/",
        element: <MeldekortHeader />,
      },
    ]);

    render(<RouterProvider router={testRouter} />);

    // Sjekk at viser overskrift
    await waitFor(() => screen.findByText("overskrift.meldekort"));

    // Sjekk at meny ikke vises (har ikke open-klasse)
    const menu = await waitFor(() => screen.findByTestId("menu"));
    expect(menu.className).not.toContain("_open_");

    // Klikk på mobileMenu
    const mobileMenu = await waitFor(() => screen.findByTestId("mobileMenu"));
    mobileMenu.click();

    // Sjekke at meny vises (har open-klasse)
    expect(menu.className).toContain("_open_");

    // Klikk på mobileMenu igjen
    mobileMenu.click();

    // Sjekk at meny ikke vises (har ikke open-klasse)
    expect(menu.className).not.toContain("_open_");
  });

  test("Skal vise Send meldekort", async () => {
    await sjekkLenke("/send-meldekort", "sekundarmeny.send");
  });

  test("Skal vise Tidligere meldekort", async () => {
    await sjekkLenke("/tidligere-meldekort", "sekundarmeny.tidligere");
  });

  test("Skal vise Etterregistrer", async () => {
    await sjekkLenke("/etterregistrer-meldekort", "sekundarmeny.etterregistrer");
  });

  test("Skal vise Om meldekort", async () => {
    await sjekkLenke("/om-meldekort", "sekundarmeny.omMeldekort");
  });

  test("Skal vise Ofte stilte sporsmal", async () => {
    await sjekkLenke("/ofte-stilte-sporsmal", "sekundarmeny.faq");
  });
});

const sjekkLenke = async (url: string, tekst: string) => {
  const innhold = tekst.toUpperCase();
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <MeldekortHeader />,
    },
    {
      path: url,
      element: <div><MeldekortHeader />{innhold}</div>,
    },
  ]);

  render(<RouterProvider router={testRouter} />);

  // Sjekk at det vises en lenke med denne teksten
  const link = await waitFor(() => screen.findByText(tekst));

  // Klikk på lenken
  link.click();

  // Sjekk at nå vi viser en ny side
  await waitFor(() => screen.findByText(innhold));

  // Sjekk at lenken på den nye siden har menuItemActive-klasse
  const nyLink = await waitFor(() => screen.findByText(tekst));
  expect(nyLink.className).toContain("_menuItemActive_");
};
