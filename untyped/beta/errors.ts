export class UnexpectedNodeTypeError extends Error {
  constructor(nodeType: string, expected: string) {
    super(`Expected ${expected} node, got ${nodeType}`);
  }
}
