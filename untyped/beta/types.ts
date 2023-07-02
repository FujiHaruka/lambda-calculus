import { AbstractionNode, ApplicationNode } from "../parser/types.ts";

/**
 * Application node is beta reducible if it's left child is abstraction.
 */
export interface BetaReducibleNode extends ApplicationNode {
  left: AbstractionNode;
}
