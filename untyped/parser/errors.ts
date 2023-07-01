import { Token } from "../tokenizer/types.ts";

export class ParserError extends Error {}

export class UnexpectedTokenError extends ParserError {
  constructor({ token, code }: { token: Token; code: string }) {
    super(`Unexpected token at position ${token.start}:

  ${code}
  ${" ".repeat(token.start)}${"~".repeat(token.end - token.start)}
`);
  }
}

export class ParenthesisNotClosedError extends ParserError {
  constructor() {
    super(`Parenthesis not closed at the end of the input`);
  }
}
