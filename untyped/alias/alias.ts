import { parse } from "../parse.ts";
import type { Node } from "../parser/types.ts";
import { PlainExpressionAlias } from "./types.ts";

export class ExpressionAlias {
  readonly identifier: string;
  readonly expression: string;
  #node: Node | undefined;

  constructor({
    identifier,
    expression,
  }: PlainExpressionAlias) {
    if (!identifier.startsWith("$")) {
      throw new Error(`Alias identifier must start with "$": "${identifier}"`);
    }

    this.identifier = identifier;
    this.expression = expression;
  }

  toNode(): Node {
    if (!this.#node) {
      this.#node = parse(this.expression);
    }

    return this.#node;
  }
}
