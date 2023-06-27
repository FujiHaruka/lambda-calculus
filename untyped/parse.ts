import { assertNever } from "./utils.ts";
import { Token } from "./tokenizer/types.ts";
import { Stack } from "./parser/Stack.ts";
import {
  ParenthesisNotClosedError,
  UnexpectedTokenError,
} from "./parser/errors.ts";
import { Node, VariableNode } from "./parser/types.ts";
import { tokenize } from "./tokenize.ts";
import { PartialNode } from "./parser/PartialNode.ts";

export function parse(code: string): Node {
  const tokens = tokenize(code);
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
          case "abstraction":
          case "application": {
            if (node.hasChild()) {
              throw new UnexpectedTokenError(token, value(token));
            }
            node.setChild(varNode);
            break;
          }
          case "any": {
            if (node.hasChild()) {
              node.evolve({
                type: "application",
                left: node.child!,
                right: varNode,
              });
            } else {
              node.setChild(varNode);
            }
            break;
          }
          default: {
            assertNever(node.type);
          }
        }
        break;
      }
      case "left_paren": {
        const nextNode = new PartialNode({
          type: "any",
        });
        stack.push(nextNode);
        break;
      }
      case "right_paren": {
        // The top node is expected to be a complete node, not a partial one.
        // e.g. In the second right parenthesis in "((a b) c)", the top node is "a b" and it's a complete node of type "application".
        if (!node || node.isImcompleteNode()) {
          throw new UnexpectedTokenError(token, value(token));
        }

        stack.pop();

        const top = stack.top();
        if (!top) {
          // Empty stack means we are done parsing
          rootNode = node.toNode();
          break;
        }

        switch (top.type) {
          case "abstraction":
          case "application": {
            if (top.hasChild()) {
              throw new UnexpectedTokenError(token, value(token));
            }

            top.setChild(node.toNode());
            break;
          }
          case "any": {
            if (top.hasChild()) {
              top.evolve({
                type: "application",
                left: top.child!,
                right: node.toNode(),
              });
            } else {
              top.evolve({
                type: "application",
                left: node.toNode(),
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
          node.evolve({
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
