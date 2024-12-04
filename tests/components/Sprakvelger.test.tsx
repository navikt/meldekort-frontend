import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import i18next from "i18next";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import Sprakvelger from "~/components/sprakvelger/Sprakvelger";


describe("Sprakvelger", () => {
  beforeAll(() => {
    vi.mock("react-i18next", () => ({
      useTranslation: () => {
        return {
          t: (args: string[]) => args[1],
          i18n: i18next,
        };
      },
    }));
  });

  afterEach(() => {
    cleanup();
  });

  test("Skal velge språk", async () => {
    const i18nSpy = vi.spyOn(i18next, "changeLanguage");
    i18nSpy.mockReturnValue(new Promise<TFunction<"translation", undefined>>(() => undefined));

    render(<Sprakvelger />);

    fireEvent.change(screen.getByLabelText("sprakvelger.chooseLanguage"), { target: { value: "en" } });
    expect(i18nSpy).toBeCalledWith("en");

    fireEvent.change(screen.getByLabelText("sprakvelger.chooseLanguage"), { target: { value: "nb" } });
    expect(i18nSpy).toBeCalledWith("nb");
  });

  test("Skal vise feil i console når ikke kan sette språk", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    vi.spyOn(i18next, "changeLanguage").mockRejectedValue("feil");

    render(<Sprakvelger />);

    fireEvent.change(screen.getByLabelText("sprakvelger.chooseLanguage"), { target: { value: "en" } });

    // Vent 1 sekund for å være sikker på at Promise ble avvist
    await new Promise((r) => setTimeout(r, 1000));

    expect(logSpy).toBeCalledWith("feil");

    logSpy.mockRestore();
  });
});
