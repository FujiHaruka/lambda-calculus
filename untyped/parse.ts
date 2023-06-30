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
  const tokens = tokenize(code, { eofToken: true });
  const value = (token: Token): string => code.slice(token.start, token.end);
  const stack = new Stack<PartialNode>();

  for (const token of tokens) {
    const node = stack.top();

    if (
      // e.g.
      // "(" + "a"
      // "(a ->" + "b"
      // "((a b)" + "c"
      token.type === "var" &&
      node &&
      !node.hasChild()
    ) {
      const varNode: VariableNode = {
        type: "var",
        identifier: value(token),
      };
      node.setChild(varNode);
    } else if (
      // e.g.
      // "" + "a"
      token.type === "var" &&
      !node
    ) {
      const nextNode = new PartialNode({
        type: "any",
        child: {
          type: "var",
          identifier: value(token),
        },
      }, {
        leftParen: false,
      });
      stack.push(nextNode);
    } else if (
      // e.g.
      // "(a" + "b"
      token.type === "var" &&
      node &&
      node.type === "any" &&
      node.hasChild()
    ) {
      const varNode: VariableNode = {
        type: "var",
        identifier: value(token),
      };
      node.evolve({
        type: "application",
        left: node.child!,
        right: varNode,
      });
    } else if (
      // e.g.
      // "(a b)" + "c"
      token.type === "var" &&
      node &&
      node.type === "application" &&
      node.isNode() &&
      node.rightParen
    ) {
      stack.pop();
      const nextNode = new PartialNode({
        type: "application",
        left: node.toNode(),
        right: {
          type: "var",
          identifier: value(token),
        },
      }, {
        leftParen: false,
      });
      stack.push(nextNode);
    } else if (
      // e.g.
      // "(a b)" + "("
      token.type === "left_paren" &&
      node &&
      node.type === "application" &&
      node.isNode() &&
      node.rightParen
    ) {
      stack.pop();
      const nextNode = new PartialNode({
        type: "application",
        left: node.toNode(),
      }, {
        leftParen: false,
      });
      stack.push(nextNode);

      const nextAnyNode = new PartialNode({
        type: "any",
      }, {
        leftParen: true,
      });
      stack.push(nextAnyNode);
    } else if (
      // e.g.
      // "("
      token.type === "left_paren"
    ) {
      const nextNode = new PartialNode({
        type: "any",
      }, {
        leftParen: true,
      });
      stack.push(nextNode);
    } else if (
      // e.g.
      // "(a -> b" + ")"
      // "((a b) c" + ")"
      token.type === "right_paren" &&
      node &&
      node.isNode()
    ) {
      // Pop and modify the top in stack because both abstractions and applications are kind of binary operators.
      stack.pop();
      const top = stack.top();
      if (!top) {
        // Empty stack means we are done parsing
        if (!node.leftParen) {
          // e.g.
          // "a -> b" + ")"
          throw new UnexpectedTokenError(token, value(token));
        }
        if (node.rightParen) {
          // e.g.
          // "(a -> b)" + ")"
          throw new UnexpectedTokenError(token, value(token));
        }
        node.rightParen = true;
        stack.push(node);
      } else {
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
      }
    } else if (
      // e.g.
      // "(a" + "->"
      token.type === "arrow" &&
      node && node.type === "any" && node.child && node.child.type === "var"
    ) {
      node.evolve({
        type: "abstraction",
        bound: node.child.identifier,
      });
    } else if (
      // e.g.
      // "a -> b" + "EOF"
      token.type === "eof" &&
      node &&
      !node.leftParen &&
      node.isNode()
    ) {
      const node = stack.pop();
      return node.toNode();
    } else if (
      // e.g.
      // "(a -> b)" + "EOF"
      token.type === "eof" &&
      node &&
      node.isNode() &&
      ((node.leftParen && node.rightParen) ||
        (!node.leftParen && !node.rightParen))
    ) {
      return node.toNode();
    } else if (
      // e.g.
      // "(a -> b" + "EOF"
      token.type === "eof" &&
      node &&
      !node.isNode() &&
      ((!node.leftParen && node.rightParen) ||
        (node.leftParen && !node.rightParen))
    ) {
      throw new ParenthesisNotClosedError();
    } else {
      throw new UnexpectedTokenError(token, value(token));
    }
  }

  throw new Error("Unexpected error");
}
