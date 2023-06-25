import { TokenizerContext } from "./TokenizerContext.ts";
import { ScanResult } from "./types.ts";

/**
 * Scan a parenthesis: "(" and ")".
 */
export function scanParenthesis(ctx: TokenizerContext): ScanResult {
  const char = ctx.code[ctx.position];

  switch (char) {
    case "(":
      return {
        type: "left_paren",
        start: ctx.position,
        end: ctx.position + 1,
      };
    case ")":
      return {
        type: "right_paren",
        start: ctx.position,
        end: ctx.position + 1,
      };
    default:
      return null;
  }
}
