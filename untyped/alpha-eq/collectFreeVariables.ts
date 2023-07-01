import { Node } from "../parser/types.ts";
import { assertNever } from "../utils.ts";

/**
 * Collect all free variables in AST
 */
export function collectFreeVariables(node: Node): Set<string> {
  switch (node.type) {
    case "var": {
      return new Set([node.identifier]);
    }
    case "abstraction": {
      const result = collectFreeVariables(node.body);
      result.delete(node.bound);
      return result;
    }
    case "application": {
      const left = collectFreeVariables(node.left);
      const right = collectFreeVariables(node.right);
      return new Set([...left, ...right]);
    }
    default: {
      assertNever(node);
    }
  }
}
