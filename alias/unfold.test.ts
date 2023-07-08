import { assertEquals, describe, it } from "../utils/testUtils.ts";
import { parse } from "../parser/parse.ts";
import { unfoldAliases } from "./unfold.ts";
import { BuiltinAliasesMap } from "./builtin.ts";

describe(unfoldAliases.name, () => {
  it("replaces alias variables with their expressions", () => {
    const node = parse("$TRUE x");
    const unfolded = unfoldAliases(node, BuiltinAliasesMap);
    assertEquals(unfolded, parse("(t -> (f -> t)) x"));
  });

  it("replaces alias variables with their expressions recursively", () => {
    const node = parse("$NOT $TRUE");
    const unfolded = unfoldAliases(node, BuiltinAliasesMap);
    // $NOT $TRUE
    // (p -> (p $FALSE $TRUE)) $TRUE
    // ((p -> ((p (t -> (f -> f))) (t -> (f -> t)))) (t -> (f -> t)))
    assertEquals(
      unfolded,
      parse("((p -> ((p (t -> (f -> f))) (t -> (f -> t)))) (t -> (f -> t)))"),
    );
  });
});
