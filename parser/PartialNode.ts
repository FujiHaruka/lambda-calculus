import { Node, PlainPartialNode } from "./types.ts";

export class PartialNode {
  type: PlainPartialNode["type"];
  node: PlainPartialNode;
  readonly leftParen: boolean;
  rightParen = false;

  constructor(
    partialNode: PlainPartialNode,
    options: { leftParen: boolean },
  ) {
    this.type = partialNode.type;
    this.node = partialNode;
    this.leftParen = options.leftParen;
  }

  isNode(): boolean {
    return !this.isImcompleteNode();
  }

  isImcompleteNode(): boolean {
    const { node } = this;
    return node.type === "any" || node.type === "root" ||
      (node.type === "abstraction" && !node.body) ||
      (node.type === "application" && !node.right);
  }

  isComplete(): boolean {
    return this.isNode() && (
      (this.leftParen && this.rightParen) ||
      (!this.leftParen && !this.rightParen)
    );
  }

  hasChild(): boolean {
    const { node } = this;
    return Boolean(
      (node.type === "any" && node.child) ||
        (node.type === "abstraction" && node.body) ||
        (node.type === "application" && node.right),
    );
  }

  get child(): Node | undefined {
    const { node } = this;
    switch (node.type) {
      case "any": {
        return node.child;
      }
      case "abstraction": {
        return node.body;
      }
      case "application": {
        return node.right;
      }
    }
    return undefined;
  }

  /**
   * Set child node. This method is only available when the node is imcomplete.
   */
  setChild(node: Node): void {
    if (!this.isImcompleteNode()) {
      throw new Error("Cannot set child to complete node");
    }

    switch (this.node.type) {
      case "abstraction": {
        this.node.body = node;
        return;
      }
      case "application": {
        this.node.right = node;
        return;
      }
      case "any": {
        this.node.child = node;
        return;
      }
      case "root": {
        throw new Error("Cannot set child to root node");
      }
    }
  }

  toNode(): Node {
    if (!this.isNode()) {
      throw new Error("Cannot convert to node");
    }

    return this.node as Node;
  }
}
