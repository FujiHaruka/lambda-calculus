import { Node } from "../parser/types.ts";
import { assertNever } from "../utils.ts";

/**
 * Replace all free occurrences of `freeVar` in AST with `replacement`
 */
export function replaceFreeVariable(
  node: Node,
  freeVar: string,
  replacement: string,
): Node {
  switch (node.type) {
    case "var": {
      return node.identifier === freeVar
        ? { type: "var", identifier: replacement }
        : node;
    }
    case "abstraction": {
      if (node.bound === freeVar) {
        // freeVar is bound in node, so we don't need to replace it.
        // e.g.
        // (x -> x) [y/x] == (x -> x)
        return node;
      } else if (node.bound !== freeVar && node.bound !== replacement) {
        // freeVar is not bound, neither is replacement, so we can replace vars in body.
        // e.g.
        // (z -> x) [y/x] == (z -> y)
        return {
          type: "abstraction",
          bound: node.bound,
          body: replaceFreeVariable(node.body, freeVar, replacement),
        };
      } else {
        // the case of node.bound === replacement
        // freeVar is not bound, but replacement is, so we need to rename the bound variable.
        // e.g.
        // (y -> x) [y/x] == (_y -> y)

        // TODO: renamed bound variable should not occur in the body.
        const newBound = `_${replacement}`;
        return {
          type: "abstraction",
          bound: newBound,
          body: replaceFreeVariable(
            replaceFreeVariable(node.body, node.bound, newBound),
            freeVar,
            replacement,
          ),
        };
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
