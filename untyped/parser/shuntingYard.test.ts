import { assertEquals, it } from "../testUtils.ts";
import { tokenize } from "../tokenize.ts";
import { shunthingYard } from "./shuntingYard.ts";
import { ParserToken } from "./types.ts";

const validTokensList: {
  code: string;
  expected: ParserToken[];
}[] = [
  {
    code: "(x -> y)",
    expected: [{
      type: "var",
      identifier: "x",
    }, {
      type: "var",
      identifier: "y",
    }, {
      type: "abstraction",
    }],
  },
  {
    code: "(x -> (y -> (z -> abc)))",
    expected: [{
      type: "var",
      identifier: "x",
    }, {
      type: "var",
      identifier: "y",
    }, {
      type: "var",
      identifier: "z",
    }, {
      type: "var",
      identifier: "abc",
    }, {
      type: "abstraction",
    }, {
      type: "abstraction",
    }, {
      type: "abstraction",
    }],
  },
];

validTokensList.forEach(({ code, expected }) => {
  it(`shunthingYard "${code}"`, () => {
    const tokens = tokenize(code);
    const result = shunthingYard(code, tokens);
    assertEquals(result, expected);
  });
});
