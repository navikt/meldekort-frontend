import { DateTime } from "luxon";
import { describe, expect, test } from "vitest";

import {
  formaterDato,
  formaterPeriode,
  formaterPeriodeDato,
  formaterPeriodeTilUkenummer,
  formaterTid,
  ukeFormatert,
} from "~/utils/datoUtils";


describe("Dato utils", () => {
  test("formaterDato skal fungere med DateTime", () => {
    const result = formaterDato(DateTime.fromISO("2024-02-07"));

    expect(result).toBe("07.02.2024");
  });

  test("formaterDato skal fungere med string", () => {
    const result = formaterDato("2024-11-25");

    expect(result).toBe("25.11.2024");
  });

  test("formaterTid skal fungere med DateTime", () => {
    const result = formaterTid(DateTime.fromISO("2024-02-07T09:01"));

    expect(result).toBe("09:01");
  });

  test("formaterTid skal fungere med string", () => {
    const result = formaterTid("2024-02-07T13:25");

    expect(result).toBe("13:25");
  });

  test("formaterPeriodeDato skal fungere med DateTime", () => {
    const result = formaterPeriodeDato(DateTime.fromISO("2024-02-07"), DateTime.fromISO("2024-11-20"));

    expect(result).toBe("07.02.2024 - 20.11.2024");
  });

  test("formaterPeriodeDato skal fungere med string", () => {
    const result = formaterPeriodeDato("2024-05-25", "2024-11-05");

    expect(result).toBe("25.05.2024 - 05.11.2024");
  });

  test("formaterPeriodeTilUkenummer skal fungere med DateTime", () => {
    const result = formaterPeriodeTilUkenummer(DateTime.fromISO("2024-02-19"), DateTime.fromISO("2024-03-03"));

    expect(result).toBe("8 - 9");
  });

  test("formaterPeriodeTilUkenummer skal fungere med string", () => {
    const result = formaterPeriodeTilUkenummer("2024-02-19", "2024-03-03");

    expect(result).toBe("8 - 9");
  });

  test("formaterPeriode skal fungere med string", () => {
    const result = formaterPeriode("2024-02-19", 7, 14);

    expect(result).toBe("9 - 10 (26.02.2024 - 10.03.2024)");
  });

  test("ukeFormatert skal fungere uten plussDager", () => {
    const result = ukeFormatert("2024-02-19");

    expect(result).toBe("10 (04.03.2024 - 10.03.2024)");
  });

  test("ukeFormatert skal fungere med plussDager", () => {
    const result = ukeFormatert("2024-02-19", 7);

    expect(result).toBe("9 (26.02.2024 - 03.03.2024)");
  });
});
