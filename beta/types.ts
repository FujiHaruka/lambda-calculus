import { AbstractionNode, ApplicationNode } from "../parser/types.ts";

/**
 * Node for beta-redex.
 * Application node is beta reducible if it's left child is abstraction.
 */
export interface BetaReducibleNode extends ApplicationNode {
  left: AbstractionNode;
}

export type NodePathComponent =
  | "abstraction_body"
  | "application_left"
  | "application_right";

export type NodePath = NodePathComponent[];
