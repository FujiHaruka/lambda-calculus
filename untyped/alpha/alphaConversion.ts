import { AbstractionNode } from "../parser/types.ts";
import { collectFreeVariables, replaceFreeVariable } from "./variable.ts";

/**
 * Perform alpha convertion on abstraction node.
 * Alpha conversion for x -> M with x:=y is y -> M[y:=x] if y is not free in M.
 */
export function performAlphaConvertion(
  abstractionNode: AbstractionNode,
  replacement: string,
): AbstractionNode {
  if (abstractionNode.type !== "abstraction") {
    throw new Error(`Expected abstraction node, got ${abstractionNode.type}`);
  }

  const freeVars = collectFreeVariables(abstractionNode.body);
  if (freeVars.has(replacement)) {
    throw new Error(
      `Cannot perform alpha convertion: ${replacement} is free in the body of abstraction node.`,
    );
  }

  return {
    type: "abstraction",
    bound: replacement,
    body: replaceFreeVariable(
      abstractionNode.body,
      abstractionNode.bound,
      {
        type: "var",
        identifier: replacement,
      },
    ),
  };
}
