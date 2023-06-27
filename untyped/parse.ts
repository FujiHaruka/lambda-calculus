import { assertNever } from "./utils.ts";
import { Token } from "./tokenizer/types.ts";
import { Stack } from "./parser/Stack.ts";
import {
  ParenthesisNotClosedError,
  UnexpectedTokenError,
} from "./parser/errors.ts";
import { Node, PartialNode, VariableNode } from "./parser/types.ts";
import { isNode } from "./parser/isNode.ts";

export function parse(code: string, tokens: Token[]): Node {
  const value = (token: Token): string => code.slice(token.start, token.end);
  const stack = new Stack<PartialNode>();
  let rootNode: Node | null = null;

  for (const token of tokens) {
    const node = stack.top();

    switch (token.type) {
      case "var": {
        if (!node) {
          // This is a special case where the first token is a variable.
          // TODO: handle edge cases like there are more tokens after this one.
          return {
            type: "var",
            identifier: value(token),
          };
        }

        const varNode: VariableNode = {
          type: "var",
          identifier: value(token),
        };
        switch (node.type) {
          case "var": {
            throw new UnexpectedTokenError(token, value(token));
          }
          case "abstraction": {
            if (node.body) {
              throw new UnexpectedTokenError(token, value(token));
            }
            node.body = varNode;
            break;
          }
          case "application": {
            if (node.right) {
              throw new UnexpectedTokenError(token, value(token));
            }
            node.right = varNode;
            break;
          }
          case "any": {
            if (node.child) {
              stack.replaceTop({
                type: "application",
                left: node.child,
                right: varNode,
              });
            } else {
              node.child = varNode;
            }
            break;
          }
          default: {
            assertNever(node);
          }
        }
        break;
      }
      case "left_paren": {
        stack.push({
          type: "any",
        });
        break;
      }
      case "right_paren": {
        if (!node) {
          throw new UnexpectedTokenError(token, value(token));
        }

        // Popped node is expected to be a complete node, not a partial one.
        // e.g. In the second right parenthesis in "((a b) c)", the popped node is "a b" and it's a complete node of type "application".
        const popped = stack.pop();
        if (!isNode(popped)) {
          throw new UnexpectedTokenError(token, value(token));
        }

        const top = stack.top();
        if (!top) {
          // Empty stack means we are done parsing
          rootNode = popped;
          break;
        }

        switch (top.type) {
          case "var": {
            throw new UnexpectedTokenError(token, value(token));
          }
          case "abstraction": {
            if (top.body) {
              throw new UnexpectedTokenError(token, value(token));
            }

            top.body = popped;
            break;
          }
          case "application": {
            if (top.right) {
              throw new UnexpectedTokenError(token, value(token));
            }

            top.right = popped;
            break;
          }
          case "any": {
            if (top.child) {
              stack.replaceTop({
                type: "application",
                left: top.child,
                right: popped,
              });
            } else {
              stack.replaceTop({
                type: "application",
                left: popped,
              });
            }
          }
        }
        break;
      }
      case "arrow": {
        if (
          node && node.type === "any" && node.child && node.child.type === "var"
        ) {
          stack.replaceTop({
            type: "abstraction",
            bound: node.child.identifier,
          });
        } else {
          throw new UnexpectedTokenError(token, value(token));
        }
        break;
      }
      default: {
        assertNever(token.type);
      }
    }
  }

  if (!stack.empty()) {
    throw new ParenthesisNotClosedError();
  }
  if (!rootNode) {
    // This should never happen
    throw new Error("Root node is null");
  }

  return rootNode;
}
