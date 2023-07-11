import { assertThrows, describe, it } from "../utils/testUtils.ts";
import { assertNever } from "./utils.ts";

describe(assertNever.name, () => {
  it("throws", () => {
    assertThrows(() => assertNever(null as never));
  });
});
