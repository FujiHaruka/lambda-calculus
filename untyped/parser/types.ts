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

/**
 * Token in the context of parser
 */
export type ParserTokenType =
  | "var"
  | "left_paren"
  | "right_paren"
  | "abstraction"
  | "application";

export type ParserToken =
  | Readonly<{
    type: Omit<ParserTokenType, "var">;
  }>
  | Readonly<{
    type: "var";
    identifier: string;
  }>;
