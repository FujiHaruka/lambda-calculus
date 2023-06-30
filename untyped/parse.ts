import { Token } from "./tokenizer/types.ts";
import { Stack } from "./parser/Stack.ts";
import {
  ParenthesisNotClosedError,
  UnexpectedTokenError,
} from "./parser/errors.ts";
import { Node } from "./parser/types.ts";
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
      // "a b" + "c"
      // "(a b" + "c"
      token.type === "var" &&
      node &&
      node.isNode() &&
      !node.rightParen
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
        leftParen: node.leftParen,
      });
      stack.push(nextNode);
    } else if (
      // e.g.
      // "(" + "a"
      // "(a ->" + "b"
      // "((a b)" + "c"
      token.type === "var" &&
      node &&
      !node.hasChild()
    ) {
      node.setChild({
        type: "var",
        identifier: value(token),
      });
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
      stack.pop();
      stack.push(
        new PartialNode({
          type: "application",
          left: node.child!,
          right: {
            type: "var",
            identifier: value(token),
          },
        }, {
          leftParen: node.leftParen,
        }),
      );
    } else if (
      // e.g.
      // "(a b)" + "c"
      // "(a -> b)" + "c"
      token.type === "var" &&
      node &&
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
      // "a b" + "("
      token.type === "left_paren" &&
      node &&
      node.type === "application" &&
      node.isNode() &&
      !node.rightParen
    ) {
      stack.pop();
      const nextNode = new PartialNode({
        type: "application",
        left: node.toNode(),
      }, {
        leftParen: node.leftParen,
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
      // "(a b)" + "("
      // "(a -> b)" + "("
      token.type === "left_paren" &&
      node &&
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
      node.isNode() &&
      !node.isComplete()
    ) {
      // "(a -> b" + ")"
      // Pop and modify the top in stack because both abstractions and applications are kind of binary operators.
      stack.pop();
      const top = stack.top();
      if (!top) {
        // Empty stack means we are done parsing
        node.rightParen = true;
        stack.push(node);
      } else {
        // "(a (b c" + ")"
        switch (top.type) {
          case "abstraction":
          case "application": {
            top.setChild(node.toNode());
            break;
          }
          case "any": {
            if (top.hasChild()) {
              stack.pop();
              stack.push(
                new PartialNode({
                  type: "application",
                  left: top.child!,
                  right: node.toNode(),
                }, {
                  leftParen: top.leftParen,
                }),
              );
            } else {
              stack.pop();
              stack.push(
                new PartialNode({
                  type: "application",
                  left: node.toNode(),
                }, {
                  leftParen: top.leftParen,
                }),
              );
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
      stack.pop();
      stack.push(
        new PartialNode({
          type: "abstraction",
          bound: node.child.identifier,
        }, {
          leftParen: node.leftParen,
        }),
      );
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
      node.isComplete()
    ) {
      return node.toNode();
    } else if (
      // e.g.
      // "(a -> b" + "EOF"
      token.type === "eof" &&
      node &&
      !node.isNode()
    ) {
      throw new ParenthesisNotClosedError();
    } else {
      throw new UnexpectedTokenError(token, value(token));
    }
  }

  throw new Error("Unexpected error");
}
