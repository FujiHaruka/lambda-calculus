import { Node } from "../parser/types.ts";
import { assertNever } from "../utils/utils.ts";
import { UnsupportedSubstitutionError } from "./errors.ts";

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
 * Replace all free occurrences of `freeVar` in AST with `replacement`
 */
export function replaceFreeVariable(
  node: Node,
  freeVar: string,
  replacement: Node,
): Node {
  switch (node.type) {
    case "var": {
      return node.identifier === freeVar ? structuredClone(replacement) : node;
    }
    case "abstraction": {
      if (node.bound === freeVar) {
        // freeVar is bound in node, so we don't need to replace it.
        // e.g.
        // (x -> x) [x:=y] == (x -> x)
        return node;
      } else if (
        node.bound !== freeVar &&
        !collectFreeVariables(replacement).has(node.bound)
      ) {
        // freeVar is not bound, neither is replacement, so we can replace vars in body.
        // e.g.
        // (z -> x) [x:=y] == (z -> y)
        return {
          type: "abstraction",
          bound: node.bound,
          body: replaceFreeVariable(node.body, freeVar, replacement),
        };
      } else {
        // the case of node.bound === replacement
        // freeVar is not bound, but replacement is, so we need to rename the bound variable.
        // e.g.
        // (y -> x) [x:=y] == (_y -> y)

        throw new UnsupportedSubstitutionError(
          "Replacing free variable with already bound variable is not supported.",
        );
      }
    }
    case "application": {
      return {
        type: "application",
        left: replaceFreeVariable(node.left, freeVar, replacement),
        right: replaceFreeVariable(node.right, freeVar, replacement),
      };
    }
    default: {
      assertNever(node);
    }
  }
}
