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
  stack.push(
    new PartialNode({
      type: "root",
    }, {
      leftParen: false,
    }),
  );

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
      node.type !== "root" &&
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
      node &&
      node.type === "root"
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
      // "(a (b c" + ")"
      token.type === "right_paren" &&
      node &&
      node.isNode() &&
      !node.isComplete()
    ) {
      stack.pop();
      const top = stack.pop();
      switch (top.type) {
        case "abstraction":
        case "application": {
          // e.g.
          // "(x -> (y -> z" + ")"
          // "(x (y z" + ")"
          top.setChild(node.toNode());
          stack.push(top);
          break;
        }
        case "any": {
          const children = top.hasChild()
            // e.g.
            // "(a (b c" + ")"
            ? {
              left: top.child!,
              right: node.toNode(),
            }
            // e.g.
            // "((x y" + ")"
            : {
              left: node.toNode(),
            };
          stack.push(
            new PartialNode({
              type: "application",
              ...children,
            }, {
              leftParen: top.leftParen,
            }),
          );
          break;
        }
        case "root": {
          node.rightParen = true;
          stack.push(node);
          break;
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
