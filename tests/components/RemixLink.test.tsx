import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import type { MouseEventHandler, ReactNode } from "react";
import * as React from "react";
import { RemixLink } from "~/components/RemixLink";
import { PrinterSmallFillIcon } from "@navikt/aksel-icons";


describe("RemixLink", () => {
  afterEach(() => {
    cleanup()
  })

  test("Skal vise som Link", async () => {
    createRouteAndRender("Link")

    const link = await waitFor(() => screen.findByText("FIRST"))
    link.click()

    await waitFor(() => screen.findByText("SECOND"))
  })

  test("Skal vise som Link med icon left", async () => {
    const spy = vi.fn()
    createRouteAndRender(
      "Link",
      <PrinterSmallFillIcon aria-hidden />,
      "left",
      () => {
        spy()
      }
    )

    const link = await waitFor(() => screen.findByText("FIRST"))

    // Sjekk at ikonet er på riktig side
    expect(link.innerHTML.endsWith("FIRST")).toBeTruthy()

    link.click()

    expect(spy).toBeCalled()
    await waitFor(() => screen.findByText("SECOND"))
  })

  test("Skal vise som Link med icon right", async () => {
    const spy = vi.fn()
    createRouteAndRender(
      "Link",
      <PrinterSmallFillIcon aria-hidden />,
      "right",
      (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        spy()
      }
    )

    const link = await waitFor(() => screen.findByText("FIRST"))

    // Sjekk at ikonet er på riktig side
    expect(link.innerHTML.startsWith("FIRST")).toBeTruthy()

    link.click()

    expect(spy).toBeCalled()
    await waitFor(() => screen.findByText("FIRST"))
  })

  test("Skal vise som Button", async () => {
    createRouteAndRender("Button")

    const link = await waitFor(() => screen.findByText("FIRST"))
    link.click()

    await waitFor(() => screen.findByText("SECOND"))
  })

  test("Skal vise som Button med icon left", async () => {
    const spy = vi.fn()
    createRouteAndRender(
      "Button",
      <PrinterSmallFillIcon aria-hidden />,
      "left",
      () => {
        spy()
      }
    )

    const link = await waitFor(() => screen.findByText("FIRST"))

    // Sjekk at ikonet er på riktig side
    const children = link?.parentElement?.children
    expect(children?.length).toBe(2)
    expect(children?.item(0)?.attributes.getNamedItem("class")?.value).toBe("navds-button__icon")

    link.click()

    await waitFor(() => screen.findByText("SECOND"))
  })

  test("Skal vise som Button med icon right", async () => {
    const spy = vi.fn()
    createRouteAndRender(
      "Button",
      <PrinterSmallFillIcon aria-hidden />,
      "right",
      (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        spy()
      }
    )

    const link = await waitFor(() => screen.findByText("FIRST"))

    // Sjekk at ikonet er på riktig side
    const children = link?.parentElement?.children
    expect(children?.length).toBe(2)
    expect(children?.item(1)?.attributes.getNamedItem("class")?.value).toBe("navds-button__icon")

    link.click()

    expect(spy).toBeCalled()
    await waitFor(() => screen.findByText("FIRST"))
  })
})

const createRouteAndRender = (as: "Link" | "Button", icon?: ReactNode, iconPosition?: "left" | "right", onClick?: MouseEventHandler) => {
  const testRouter = createMemoryRouter([
    {
      path: "/",
      element: <RemixLink as={as} to={"/neste"} icon={icon} iconPosition={iconPosition}
                          onClick={onClick}>FIRST</RemixLink>
    },
    {
      path: "/neste",
      element: <div>SECOND</div>
    }
  ])

  render(<RouterProvider router={testRouter} />)
}
