export type NodeType = "var" | "abstraction" | "application";

export type Node = VariableNode | AbstractionNode | ApplicationNode;

/**
 * Variable identifier.
 */
export type VariableNode = Readonly<{
  type: "var";
  identifier: string;
}>;

/**
 * Lambda abstraction.
 */
export type AbstractionNode = Readonly<{
  type: "abstraction";
  /** identifier of bound variable */
  bound: string;
  /** function body */
  body: Node;
}>;

/**
 * Application
 */
export type ApplicationNode = Readonly<{
  type: "application";
  /** function node */
  left: Node;
  /** argument node */
  right: Node;
}>;

export type PartialAbstractionNode = {
  type: "abstraction";
  bound: string;
  body?: Node;
};

export type PartialApplicationNode = {
  type: "application";
  left: Node;
  right?: Node;
};

export type PartialAnyNode = {
  type: "any";
  child?: Node;
};

export type PartialRootNode = {
  type: "root";
};

export type PlainPartialNode =
  | PartialAbstractionNode
  | PartialApplicationNode
  | PartialAnyNode
  | PartialRootNode;
