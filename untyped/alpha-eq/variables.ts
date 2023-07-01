import { Node } from "../parser/types.ts";
import { assertNever } from "../utils.ts";

/**
 * Collect all bound variables in AST
 */
export function collectBoundVariables(node: Node): Set<string> {
  switch (node.type) {
    case "var": {
      return new Set();
    }
    case "abstraction": {
      const result = collectBoundVariables(node.body);
      result.add(node.bound);
      return result;
    }
    case "application": {
      const left = collectBoundVariables(node.left);
      const right = collectBoundVariables(node.right);
      return new Set([...left, ...right]);
    }
    default: {
      assertNever(node);
    }
  }
}

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
