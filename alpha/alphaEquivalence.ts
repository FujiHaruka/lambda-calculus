import { equal } from "../beta/node.ts";
import { Node } from "../parser/types.ts";
import { assertNever } from "../utils/utils.ts";

/**
 * Check if two nodes are alpha equivalent.
 */
export function isAlphaEquivalent(aNode: Node, bNode: Node): boolean {
  const normalizedA = new NodeNormalizer(aNode).normalize();
  const normalizedB = new NodeNormalizer(bNode).normalize();
  return equal(normalizedA, normalizedB);
}

/**
 * Normalize node by recursively performing alpha convertion.
 */
export class NodeNormalizer {
  readonly #map = new Map<string, string>();
  #counter = 0;

  constructor(private readonly _node: Node) {}

  normalize(): Node {
    return this.#normalize(this._node);
  }

  #normalize(node: Node): Node {
    switch (node.type) {
      case "var": {
        const replacement = this.#map.get(node.identifier);
        if (replacement) {
          return { type: "var", identifier: replacement };
        }
        return node;
      }
      case "abstraction": {
        const { bound } = node;
        const replacement = this.#popNextReplacement();
        this.#map.set(bound, replacement);
        const body = this.#normalize(node.body);
        this.#map.delete(bound);
        return { type: "abstraction", bound: replacement, body };
      }
      case "application": {
        const left = this.#normalize(node.left);
        const right = this.#normalize(node.right);
        return { type: "application", left, right };
      }
      default: {
        assertNever(node);
      }
    }
  }

  #popNextReplacement(): string {
    const count = this.#counter;
    this.#counter++;
    return `x_${count}`;
  }
}
