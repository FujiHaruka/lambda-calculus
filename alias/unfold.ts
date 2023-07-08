import { Node } from "../parser/types.ts";
import { assertNever } from "../utils.ts";
import { ExpressionAlias } from "./alias.ts";

/**
 * Recursively replace alias variables with their expressions.
 */
export function unfoldAliases(
  node: Node,
  aliases: Map<string, /** identifier */ ExpressionAlias>,
): Node {
  switch (node.type) {
    case "var": {
      const alias = aliases.get(node.identifier);
      if (alias) {
        return unfoldAliases(alias.toNode(), aliases);
      } else {
        return node;
      }
    }
    case "abstraction": {
      return {
        type: "abstraction",
        bound: node.bound,
        body: unfoldAliases(node.body, aliases),
      };
    }
    case "application": {
      return {
        type: "application",
        left: unfoldAliases(node.left, aliases),
        right: unfoldAliases(node.right, aliases),
      };
    }
    default: {
      assertNever(node);
    }
  }
}
