import { replaceFreeVariable } from "../alpha/variable.ts";
import { Node } from "../parser/types.ts";
import { InfiniteReductionError, MaxReductionExceededError } from "./errors.ts";
import {
  assertNodeType,
  equal,
  findLeftmostOutermostRedex,
  NodeFound,
  replace,
} from "./node.ts";
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

/**
 * Perform beta reduction until beta normal form, i.e. no more beta-reducible.
 * Note that there is no guarantee that a lambda term has a beta normal form.
 * If it doesn't, the reduction process will never terminate in general.
 * For example, the lambda term "(λx. x x) (λx. x x)" has no beta normal form:
 * To avoid infinite loop, this function will throw an error if the reduction process exceeds the limit.
 */
export function performBetaReductionUntilDone(
  node: Node,
  options: { maxReductionCount?: number } = {},
): Node[] {
  const { maxReductionCount = 100 } = options;
  if (maxReductionCount < 1) {
    throw new Error("maxReductionCount must be greater than 0");
  }

  const reductionHistory: Node[] = [];

  let reductionCount = 0;
  let currentNode: Node = node;
  while (true) {
    if (reductionCount > maxReductionCount) {
      throw new MaxReductionExceededError();
    }

    const reduced = performBetaReduction(currentNode);
    if (reduced === RedexNotFound) {
      break;
    }
    if (equal(currentNode, reduced)) {
      throw new InfiniteReductionError();
    }

    reductionCount++;
    reductionHistory.push(reduced);
    currentNode = reduced;
  }

  return reductionHistory;
}
