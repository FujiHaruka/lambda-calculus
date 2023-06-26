import { assertNever } from "../utils.ts";
import { Token } from "../tokenizer/types.ts";
import { Stack } from "./Stack.ts";
import { UnexpectedTokenError } from "./errors.ts";
import { Node, PartialNode, VariableNode } from "./types.ts";

export function parse(code: string, tokens: Token[]): Node {
  const value = (token: Token): string => code.slice(token.start, token.end);
  const stack = new Stack<PartialNode>();

  for (const token of tokens) {
    const node = stack.top();

    if (node) {
      switch (token.type) {
        case "var": {
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
                throw new UnexpectedTokenError(token, value(token));
              }
              node.child = varNode;
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
          break;
        }
        case "arrow": {
          if (node.type === "any" && node.child && node.child.type === "var") {
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
    } else {
      // First token
      switch (token.type) {
        case "var": {
          stack.push({
            type: "var",
            identifier: value(token),
          });
          break;
        }
        case "left_paren": {
          stack.push({
            type: "any",
          });
          break;
        }
        case "right_paren": {
          throw new UnexpectedTokenError(token, value(token));
        }
        case "arrow": {
          throw new UnexpectedTokenError(token, value(token));
        }
        default: {
          assertNever(token.type);
        }
      }
    }
  }

  const node = stack.pop();
  if (!stack.empty()) {
    throw new Error("Stack is not empty");
  }
  if (node.type === "any") {
    throw new Error("Node is still any");
  }

  // TODO: Check if node is not partial
  return node as Node;
}
