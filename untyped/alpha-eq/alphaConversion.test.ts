import { parse } from "../parse.ts";
import { AbstractionNode } from "../parser/types.ts";
import { stringify } from "../stringify.ts";
import { assertEquals, assertThrows, describe, it } from "../testUtils.ts";
import { performAlphaConvertion } from "./alphaConversion.ts";

describe(performAlphaConvertion.name, () => {
  it("works with simple example", () => {
    const node = parse("(x -> y)") as AbstractionNode;
    const result = performAlphaConvertion(node, "z");
    assertEquals(stringify(result), "(z -> y)");
  });

  it("doesn't replace bound variable in the body", () => {
    const node = parse("(x -> ((x -> x) x))") as AbstractionNode;
    const result = performAlphaConvertion(node, "y");
    assertEquals(stringify(result), "(y -> ((x -> x) y))");
  });

  it("throws if the node is not an abstraction", () => {
    const node = parse("(x y)") as AbstractionNode;
    assertThrows(() => performAlphaConvertion(node, "z"));
  });

  it("throws if the replacement is free in the body", () => {
    const node = parse("(x -> y)") as AbstractionNode;
    assertThrows(() => performAlphaConvertion(node, "y"));
  });
});
