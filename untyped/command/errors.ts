export class UnknownCommandError extends Error {
  constructor(command: string) {
    super(`Unknown command "${command}"`);
  }
}

export class CommandExpectedError extends Error {
  constructor() {
    super("Cannot parse line as command. Expected a command.");
  }
}

export class CommandArgumentExpectedError extends Error {
  constructor(command: string) {
    super(`Command "${command}" expects an argument`);
  }
}

export class CommandArgumentUnexpectedError extends Error {
  constructor(command: string) {
    super(`Command "${command}" does not expect an argument`);
  }
}

export class UnsupportedRightHandSideCommandError extends Error {
  constructor(command: string) {
    super(`Command "${command}" does not support right hand side`);
  }
}
