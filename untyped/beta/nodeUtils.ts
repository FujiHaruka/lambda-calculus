import { Node, NodeType } from "../parser/types.ts";
import { assertNever } from "../utils.ts";
import { UnexpectedNodeTypeError } from "./errors.ts";
import { BetaReducibleNode, NodePath } from "./types.ts";

export function isBetaReducible(node: Node): node is BetaReducibleNode {
  return node.type === "application" && node.left.type === "abstraction";
}

function assertNodeType<T extends NodeType>(
  type: string,
  expected: T,
): asserts type is T {
  if (type !== expected) {
    throw new UnexpectedNodeTypeError(type, expected);
  }
}

/**
 * Slice node by path.
 */
export function slice(node: Node, path: NodePath): Node {
  if (path.length === 0) {
    return node;
  }

  const [head, ...tail] = path;
  switch (head) {
    case "abstraction_body":
      assertNodeType(node.type, "abstraction");
      return slice(node.body, tail);
    case "application_left":
      assertNodeType(node.type, "application");
      return slice(node.left, tail);
    case "application_right":
      assertNodeType(node.type, "application");
      return slice(node.right, tail);
    default: {
      assertNever(head);
    }
  }
}

/**
 * Replace sub node by path.
 */
export function replace(node: Node, path: NodePath, replacement: Node): Node {
  if (path.length === 0) {
    return replacement;
  }

  const [head, ...tail] = path;
  switch (head) {
    case "abstraction_body":
      assertNodeType(node.type, "abstraction");
      return {
        ...node,
        body: replace(node.body, tail, replacement),
      };
    case "application_left":
      assertNodeType(node.type, "application");
      return {
        ...node,
        left: replace(node.left, tail, replacement),
      };
    case "application_right":
      assertNodeType(node.type, "application");
      return {
        ...node,
        right: replace(node.right, tail, replacement),
      };
    default: {
      assertNever(head);
    }
  }
}

export const NodeFound = Symbol("NodeFound");

/**
 * Find leftmost outermost redex for the leftmost reduction strategy.
 */
export function findLeftmostOutermostRedex(
  node: Node,
): { path: NodePath; node: BetaReducibleNode } | typeof NodeFound {
  if (isBetaReducible(node)) {
    return {
      node,
      path: [],
    };
  }

  switch (node.type) {
    case "var": {
      return NodeFound;
    }
    case "abstraction": {
      const result = findLeftmostOutermostRedex(node.body);
      if (result === NodeFound) {
        return NodeFound;
      }

      return {
        node: result.node,
        path: ["abstraction_body", ...result.path],
      };
    }
    case "application": {
      if (isBetaReducible(node)) {
        return {
          node,
          path: [],
        };
      }

      const leftResult = findLeftmostOutermostRedex(node.left);
      if (leftResult !== NodeFound) {
        return {
          node: leftResult.node,
          path: ["application_left", ...leftResult.path],
        };
      }

      const rightResult = findLeftmostOutermostRedex(node.right);
      if (rightResult !== NodeFound) {
        return {
          node: rightResult.node,
          path: ["application_right", ...rightResult.path],
        };
      }

      return NodeFound;
    }
    default: {
      assertNever(node);
    }
  }
}
