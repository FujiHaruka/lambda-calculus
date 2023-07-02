import { TokenizerContext } from "./TokenizerContext.ts";
import { ScanResult } from "./types.ts";

const LowerCaseAlphabets = new Set(
  [..."abcdefghijklmnopqrstuvwxyz"],
);
const UpperCaseAlphabets = new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);
const Digits = new Set([..."0123456789"]);
const Symbols = new Set([..."_$"])
const NonDigits = new Set([...LowerCaseAlphabets, ...UpperCaseAlphabets, ...Symbols]);
const Letters = new Set([
  ...NonDigits,
  ...Digits,
]);

/**
 * Scan a variable.
 * A variable starts with non-digit letters is followed by letters, numbers and "_" + "$".
 */
export function scanVar(ctx: TokenizerContext): ScanResult {
  const start = ctx.position;
  if (!NonDigits.has(ctx.code[start])) {
    return null;
  }

  let end = start + 1;
  while (Letters.has(ctx.code[end])) {
    end++;
  }

  return {
    type: "var",
    start,
    end,
  };
}
