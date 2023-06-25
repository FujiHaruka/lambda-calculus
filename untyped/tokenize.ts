import { TokenizerContext } from "./tokenizers/TokenizerContext.ts";
import { Token } from "./tokenizers/types.ts";
import { scanSymbol } from "./tokenizers/scanSymbol.ts";
import { scanVar } from "./tokenizers/scanVar.ts";
import { UnexpectedCharacterError } from "./tokenizers/errors.ts";

function scan(ctx: TokenizerContext): Token | null {
  return scanSymbol(ctx) || scanVar(ctx);
}

/**
 * Tokenize the given code.
 */
export function tokenize(code: string): Token[] {
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

  return ctx.tokens;
}
