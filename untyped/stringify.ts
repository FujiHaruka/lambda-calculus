import { Node } from "./parser/types.ts";
import { assertNever } from "./utils.ts";

/**
 * Convert AST to code string
 */
export function stringify(node: Node): string {
  switch (node.type) {
    case "var": {
      return node.identifier;
    }
    case "abstraction": {
      return `(${node.bound} -> ${stringify(node.body)})`;
    }
    case "application": {
      return `(${stringify(node.left)} ${stringify(node.right)})`;
    }
    default: {
      assertNever(node);
    }
  }
}
