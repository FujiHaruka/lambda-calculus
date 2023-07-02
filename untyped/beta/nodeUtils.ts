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
): NodePath | typeof NodeFound {
  if (isBetaReducible(node)) {
    return [];
  }

  switch (node.type) {
    case "var": {
      return NodeFound;
    }
    case "abstraction": {
      const maybePath = findLeftmostOutermostRedex(node.body);
      if (maybePath === NodeFound) {
        return NodeFound;
      }

      return ["abstraction_body", ...maybePath];
    }
    case "application": {
      if (isBetaReducible(node)) {
        return [];
      }

      {
        const maybePath = findLeftmostOutermostRedex(node.left);
        if (maybePath !== NodeFound) {
          return ["application_left", ...maybePath];
        }
      }
      {
        const maybePath = findLeftmostOutermostRedex(node.right);
        if (maybePath !== NodeFound) {
          return ["application_right", ...maybePath];
        }
      }

      return NodeFound;
    }
    default: {
      assertNever(node);
    }
  }
}
