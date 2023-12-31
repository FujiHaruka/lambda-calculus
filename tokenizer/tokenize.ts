import { TokenizerContext } from "./TokenizerContext.ts";
import { Token } from "./types.ts";
import { scanSymbol } from "./scanSymbol.ts";
import { scanVar } from "./scanVar.ts";
import { UnexpectedCharacterError } from "./errors.ts";

function scan(ctx: TokenizerContext): Token | null {
  return scanSymbol(ctx) || scanVar(ctx);
}

export type TokenizeOptions = {
  eofToken?: boolean;
};

/**
 * Tokenize the given code.
 */
export function tokenize(code: string, options: TokenizeOptions = {}): Token[] {
  const ctx = new TokenizerContext({ code, position: 0 });

  ctx.skipSpaces();
  while (!ctx.isEOF) {
    const maybeToken = scan(ctx);
    if (maybeToken) {
      ctx.pushToken(maybeToken);
    } else {
      throw new UnexpectedCharacterError(ctx);
    }
    ctx.skipSpaces();
  }

  if (options.eofToken) {
    return ctx.tokens.concat({
      type: "eof",
      start: ctx.position,
      end: ctx.position,
    });
  } else {
    return ctx.tokens;
  }
}
