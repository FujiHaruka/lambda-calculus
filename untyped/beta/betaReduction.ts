import { replaceFreeVariable } from "../alpha/replaceFreeVariable.ts";
import { Node } from "../parser/types.ts";
import { BetaReducibleNode } from "./types.ts";

/**
 * Perform beta reduction on application node.
 */
export function performBetaReduction(node: BetaReducibleNode): Node {
  if (node.type !== "application") {
    throw new Error(`Expected application node, got ${node.type}`);
  }

  const { left, right } = node;
  if (left.type !== "abstraction") {
    throw new Error(`Expected abstraction node, got ${left.type}`);
  }

  return replaceFreeVariable(left.body, left.bound, right);
}
