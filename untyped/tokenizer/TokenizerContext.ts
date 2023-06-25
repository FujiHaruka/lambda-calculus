import { Token } from "./types.ts";

export type TokenizerContextInit = {
  code: string;
  position: number;
};

export class TokenizerContext {
  readonly code: string;
  readonly tokens: Token[] = [];

  #position: number;

  constructor({ code, position }: TokenizerContextInit) {
    this.code = code;
    this.#position = position;
  }

  get position(): number {
    return this.#position;
  }

  get isEOF(): boolean {
    return this.#position >= this.code.length;
  }

  /**
   * Push token to the list of tokens and move cursor to the end of the token.
   */
  pushToken(token: Token): void {
    if (token.start !== this.#position) {
      throw new Error(
        `Cannot move cursor by a token that does not start at current position. Current position is ${this.#position} but token starts at ${token.start}`,
      );
    }

    if (token.end <= this.#position) {
      throw new Error(
        `Cannot move cursor backwards. Current position is ${this.#position} but token ends at ${token.start}`,
      );
    }

    this.tokens.push(token);
    this.#position = token.end;
  }

  /**
   * Skip spaces until the next non-space character.
   */
  skipSpaces(): void {
    while (!this.isEOF && this.code[this.#position] === " ") {
      this.#position++;
    }
  }
}
