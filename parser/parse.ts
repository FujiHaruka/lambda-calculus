import { Token } from "../tokenizer/types.ts";
import { Stack } from "./Stack.ts";
import { ParenthesisNotClosedError, UnexpectedTokenError } from "./errors.ts";
import {
  AbstractionNode,
  ApplicationNode,
  Node,
  VariableNode,
} from "./types.ts";
import { tokenize } from "../tokenizer/tokenize.ts";
import { PartialNode } from "./PartialNode.ts";

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
      node.type !== "abstraction" &&
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
      // "a -> b" + "c"
      // "(a -> b" + "c"
      token.type === "var" &&
      node &&
      node.type === "abstraction" &&
      node.isNode() &&
      !node.rightParen
    ) {
      stack.pop();
      const abstractionNode = node.toNode() as AbstractionNode;
      stack.push(
        new PartialNode({
          type: "abstraction",
          bound: abstractionNode.bound,
        }, {
          leftParen: node.leftParen,
        }),
      );
      stack.push(
        new PartialNode({
          type: "application",
          left: abstractionNode.body,
          right: {
            type: "var",
            identifier: value(token),
          },
        }, {
          leftParen: false,
        }),
      );
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
        case "abstraction": {
          if (top.hasChild()) {
            // e.g.
            // "x -> y (z w" + ")"
            const abstractionNode = top.toNode() as AbstractionNode;
            const applicationNode: ApplicationNode = {
              type: "application",
              left: top.child!,
              right: node.toNode(),
            };
            const nextNode = new PartialNode({
              type: "abstraction",
              bound: abstractionNode.bound,
              body: applicationNode,
            }, {
              leftParen: top.leftParen,
            });
            stack.push(nextNode);
          } else {
            // e.g.
            // "(x -> (y -> z" + ")"
            top.setChild(node.toNode());
            stack.push(top);
          }
          break;
        }
        case "application": {
          // e.g.
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
      // "(a -> b -> c" + ")"
      // "(a -> b -> c -> d" + ")"
      // "(x -> y z" + ")"
      token.type === "right_paren" &&
      node &&
      node.isComplete() &&
      stack.size >= 2
    ) {
      let childNode = node.toNode();
      stack.pop();

      const top = stack.top();
      while (
        top &&
        top.type === "abstraction" &&
        !top.hasChild() &&
        !top.leftParen
      ) {
        top.setChild(childNode);
        childNode = top.toNode();
        stack.pop();
      }

      const nextNode = stack.pop();
      if (
        nextNode &&
        nextNode.type === "abstraction" &&
        !nextNode.hasChild() &&
        nextNode.leftParen
      ) {
        nextNode.setChild(childNode);
        nextNode.rightParen = true;
      } else {
        throw new UnexpectedTokenError({ token, code });
      }

      const anyNode = stack.top();
      if (
        anyNode &&
        anyNode.type === "any" &&
        !anyNode.hasChild()
      ) {
        stack.pop();
        stack.push(
          new PartialNode({
            type: "application",
            left: nextNode.toNode(),
          }, {
            leftParen: anyNode.leftParen,
          }),
        );
      } else {
        stack.push(nextNode);
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
      // "a -> b" + "->"
      // "(a -> b" + "->"
      token.type === "arrow" &&
      node &&
      node.type === "abstraction" &&
      node.isNode() &&
      node.child?.type === "var" &&
      !node.rightParen
    ) {
      const abstractionNode = node.toNode() as AbstractionNode;
      const body = abstractionNode.body as VariableNode;
      stack.pop();
      stack.push(
        new PartialNode({
          type: "abstraction",
          bound: abstractionNode.bound,
        }, {
          leftParen: node.leftParen,
        }),
      );
      stack.push(
        new PartialNode({
          type: "abstraction",
          bound: body.identifier,
        }, {
          leftParen: false,
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
      let resultNode = node.toNode();
      stack.pop();
      // Reduce until root node
      while (!stack.empty() && stack.top()?.type !== "root") {
        const node = stack.pop();
        if (node.isComplete()) {
          throw new Error("Unexpected error");
        }
        node.setChild(resultNode);
        resultNode = node.toNode();
      }
      return resultNode;
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
      // "a" + "EOF"
      token.type === "eof" &&
      node &&
      node.type === "any" &&
      !node.leftParen &&
      node.child
    ) {
      return node.child;
    } else if (
      // e.g.
      // "(a -> b" + "EOF"
      token.type === "eof" &&
      node &&
      !node.isComplete()
    ) {
      throw new ParenthesisNotClosedError();
    } else {
      throw new UnexpectedTokenError({ token, code });
    }
  }

  throw new Error("Unexpected error");
}
