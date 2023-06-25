import type { TokenizerContext } from "./TokenizerContext.ts";

export class TokenError extends Error {}

export class UnexpectedCharacterError extends Error {
  constructor(ctx: TokenizerContext) {
    super(
      `Unexpected character at position ${ctx.position}: "${
        ctx.code[ctx.position]
      }"`,
    );
  }
}
