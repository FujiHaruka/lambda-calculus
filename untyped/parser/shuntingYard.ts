import { Token } from "../tokenizer/types.ts";
import { Stack } from "./Stack.ts";
import { ParserToken } from "./types.ts";

/**
 * Convert tokens to parser tokens using the shunting yard algorithm.
 */
export function shunthingYard(code: string, tokens: Token[]): ParserToken[] {
  const value = (token: Token): string => code.slice(token.start, token.end);

  const queue: ParserToken[] = [];

  const stack = new Stack<ParserToken>();

  for (const token of tokens) {
    switch (token.type) {
      case "var": {
        queue.push({
          type: "var",
          identifier: value(token),
        });
        break;
      }
      case "arrow": {
        stack.push({
          type: "abstraction",
        });
        break;
      }
      case "left_paren": {
        stack.push({
          type: "left_paren",
        });
        break;
      }
      case "right_paren":
        while (stack.top()?.type !== "left_paren") {
          const top = stack.pop();
          queue.push(top);
        }
        stack.pop();
        break;
      default:
        throw new Error(`Unexpected token type: "${token.type}"`);
    }
  }

  while (!stack.empty()) {
    const top = stack.pop();
    queue.push(top);
  }

  return queue;
}

// Examples
// (x y)
// ((x y) z)
// (x (y z))
// ((x -> (y -> x)) y)
// (x ((y -> x) (a -> b)))
// ((((x -> (y -> (z -> ((x z) (y z))))) a) (x -> (y -> x))) c)
