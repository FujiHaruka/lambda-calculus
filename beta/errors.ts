export class UnexpectedNodeTypeError extends Error {
  constructor(nodeType: string, expected: string) {
    super(`Expected ${expected} node, got ${nodeType}`);
  }
}

export class MaxReductionExceededError extends Error {
  constructor() {
    super(`Max reduction attempts exceeded`);
  }
}

export class InfiniteReductionError extends Error {
  constructor() {
    super(`Infinite reduction detected`);
  }
}
