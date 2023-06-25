import { TokenizerContext } from "./TokenizerContext.ts";
import { ScanResult } from "./types.ts";

const LowerCaseLetters: Readonly<Set<string>> = new Set(
  "abcdefghijklmnopqrstuvwxyz".split(""),
);
const UpperCaseLetters = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""));
const Digits = new Set("0123456789".split(""));
const Letters = new Set([
  ...LowerCaseLetters,
  ...UpperCaseLetters,
  ...Digits,
  "_",
]);

function isLowerCaseLetter(char: string): boolean {
  return LowerCaseLetters.has(char);
}

function isLetter(char: string): boolean {
  return Letters.has(char);
}

/**
 * Scan a variable.
 * A variable starts with a lower case letter and is followed by letters, numbers and underscores.
 */
export function scanVar(ctx: TokenizerContext): ScanResult {
  const start = ctx.position;
  const char = ctx.code[start];
  if (!isLowerCaseLetter(char)) {
    return null;
  }

  let end = start + 1;
  while (isLetter(ctx.code[end])) {
    end++;
  }

  return {
    type: "var",
    start,
    end,
  };
}
