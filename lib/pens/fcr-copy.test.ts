import { describe, expect, it } from "vitest";

import { describeFcrResult } from "@/lib/pens/fcr-copy";
import type { FcrResult } from "@/lib/pens/fcr";

describe("describeFcrResult", () => {
  it("formats an ok result as an FCR value with the good chip class", () => {
    const result: FcrResult = {
      ok: true,
      totalFedKg: 100,
      totalGainKg: 40,
      fcr: 2.5,
    };

    expect(describeFcrResult(result)).toEqual({
      text: "FCR 2.50",
      chipClass: "chip-good",
    });
  });

  it("maps no_pigs to a clear Spanish message, not a raw code", () => {
    expect(describeFcrResult({ ok: false, reason: "no_pigs" })).toEqual({
      text: "Este corral no tiene cerdos asignados",
      chipClass: "chip-neutral",
    });
  });

  it("maps no_feed_logged to a clear Spanish message", () => {
    expect(
      describeFcrResult({ ok: false, reason: "no_feed_logged" }),
    ).toEqual({
      text: "Todavía no se registró alimento para este corral",
      chipClass: "chip-neutral",
    });
  });

  it("maps no_weight_gain_yet to a clear Spanish message", () => {
    expect(
      describeFcrResult({ ok: false, reason: "no_weight_gain_yet" }),
    ).toEqual({
      text: "Los cerdos de este corral todavía no tienen pesajes recientes",
      chipClass: "chip-neutral",
    });
  });
});
