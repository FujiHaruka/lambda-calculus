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
          // For now, we don't support a variable as a top-level node.
          throw new UnexpectedTokenError(token, value(token));
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
            // When the top node is imcomplete abstraction/application, set the var node as its child and evolve it to a complete node.
            // e.g.
            // "(a ->" + "b"
            // "((a b)" + "c"
            node.setChild(varNode);
            break;
          }
          case "any": {
            if (node.hasChild()) {
              // When the top node is single-childed any node, evolve it to an application node.
              // e.g.
              // "(a" + "b"
              node.evolve({
                type: "application",
                left: node.child!,
                right: varNode,
              });
            } else {
              // When the top node is empty any node, set the var node as its child.
              // e.g.
              // "(" + "a"
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

        // Pop and modify the top in stack because both abstractions and applications are kind of binary operators.
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
          // When the top node is a single-childed any node and its child is a var node, evolve it to an abstraction node.
          // e.g.
          // "(a" + "->"
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
