import { TokenizerContext } from "./TokenizerContext.ts";
import { ScanResult } from "./types.ts";

/**
 * Scan a parenthesis: "->", "(" and ")".
 */
export function scanSymbol(ctx: TokenizerContext): ScanResult {
  const char = ctx.code[ctx.position];

  switch (char) {
    case "-": {
      const nextChar = ctx.code[ctx.position + 1];
      if (nextChar === ">") {
        return {
          type: "arrow",
          start: ctx.position,
          end: ctx.position + 2,
        };
      }
      break;
    }
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
  }

  return null;
}
