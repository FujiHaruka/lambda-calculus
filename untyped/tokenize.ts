import { TokenizerContext } from "./tokenizers/TokenizerContext.ts";
import { Token } from "./tokenizers/types.ts";
import { scanSymbol } from "./tokenizers/scanSymbol.ts";
import { scanVar } from "./tokenizers/scanVar.ts";
import { UnexpectedCharacterError } from "./tokenizers/errors.ts";

function scan(ctx: TokenizerContext): Token | null {
  return scanSymbol(ctx) || scanVar(ctx);
}

export function tokenize(code: string): Token[] {
  const ctx = new TokenizerContext({ code, position: 0 });
  while (!ctx.isEOF) {
    ctx.skipSpaces();
    const maybeToken = scan(ctx);
    if (maybeToken) {
      ctx.pushToken(maybeToken);
    } else {
      throw new UnexpectedCharacterError(ctx);
    }
  }

  console.log(ctx.tokens);

  return ctx.tokens;
}
