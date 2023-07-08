import { parse } from "../parser/parse.ts";
import type { Node } from "../parser/types.ts";
import { PlainExpressionAlias } from "./types.ts";

export class ExpressionAlias {
  readonly identifier: string;
  readonly expression: string;
  readonly usage?: string;
  readonly example?: string;
  #node: Node | undefined;

  constructor({
    identifier,
    expression,
    usage,
    example,
  }: PlainExpressionAlias) {
    if (!identifier.startsWith("$")) {
      throw new Error(`Alias identifier must start with "$": "${identifier}"`);
    }

    this.identifier = identifier;
    this.expression = expression;
    this.usage = usage;
    this.example = example;
  }

  toNode(): Node {
    if (!this.#node) {
      this.#node = parse(this.expression);
    }

    return this.#node;
  }
}
