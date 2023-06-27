import { Token } from "../tokenizer/types.ts";

export class ParserError extends Error {}

export class UnexpectedTokenError extends ParserError {
  constructor(token: Token, value: string) {
    super(`Unexpected token: "${value}" at position ${token.start}`);
  }
}

export class ParenthesisNotClosedError extends ParserError {
  constructor() {
    super(`Parenthesis not closed at the end of the input`);
  }
}
