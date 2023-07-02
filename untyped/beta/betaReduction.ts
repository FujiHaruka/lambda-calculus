import { replaceFreeVariable } from "../alpha/replaceFreeVariable.ts";
import { Node } from "../parser/types.ts";
import {
  assertNodeType,
  findLeftmostOutermostRedex,
  NodeFound,
  replace,
} from "./nodeUtils.ts";
import { BetaReducibleNode } from "./types.ts";

/**
 * Perform beta reduction on beta-reducible node.
 */
export function performBetaReductionToRedex(node: BetaReducibleNode): Node {
  assertNodeType(node.type, "application");

  const { left, right } = node;
  assertNodeType(left.type, "abstraction");

  return replaceFreeVariable(left.body, left.bound, right);
}

export const RedexNotFound = Symbol("Redex not found in node");

/**
 * Perform beta reduction on any node with the leftmost outermost strategy.
 */
export function performBetaReduction(node: Node): Node | typeof RedexNotFound {
  const redex = findLeftmostOutermostRedex(node);
  if (redex === NodeFound) {
    return RedexNotFound;
  }

  const reduced = performBetaReductionToRedex(redex.node);
  return replace(node, redex.path, reduced);
}
