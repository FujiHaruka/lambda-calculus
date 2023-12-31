import {
  CommandArgumentExpectedError,
  CommandArgumentUnexpectedError,
  CommandExpectedError,
  CommandUnexpectedArgumentsError,
  UnknownCommandError,
} from "./errors.ts";
import { Command } from "./types.ts";

const Commands = {
  EXIT: "EXIT",
  REDUCE: "REDUCE",
  ALPHA_EQ: "ALPHA_EQ",
  LIST: "LIST",
} as const;

const NO_ARG_COMMAND_PATTERN = /^[A-Z_]+$/;
const ARG_COMMAND_PATTERN = /^([A-Z_]+)\s+(.+)$/;

export function parseCommand(line: string): Command {
  line = line.trim();
  if (!line) {
    return {
      type: "empty",
    };
  }

  if (includesLineBreak(line)) {
    throw new Error("Multi-line expressions not supported");
  }

  if (startsWithUpperCase(line)) {
    // Commands without arguments
    if (NO_ARG_COMMAND_PATTERN.test(line)) {
      switch (line) {
        case Commands.EXIT:
          return { type: "exit" };
        case Commands.LIST:
          return { type: "list" };
        case Commands.REDUCE:
        case Commands.ALPHA_EQ:
          throw new CommandArgumentExpectedError(line);
        default:
          throw new UnknownCommandError(line);
      }
    }

    // Commands with an argument
    const match = line.match(ARG_COMMAND_PATTERN);
    if (!match) {
      throw new CommandExpectedError();
    }

    const [, commandName, arg] = match;
    switch (commandName) {
      case Commands.REDUCE:
        return { type: "reduce", expression: arg };
      case Commands.ALPHA_EQ: {
        const expressions = arg.split(",").map((str) => str.trim());
        if (expressions.length !== 2) {
          throw new CommandUnexpectedArgumentsError(
            commandName,
            2,
            expressions.length,
          );
        }
        return {
          type: "eq",
          expressionA: expressions[0],
          expressionB: expressions[1],
        };
      }
      case Commands.LIST:
      case Commands.EXIT:
        throw new CommandArgumentUnexpectedError(commandName);
      default:
        throw new UnknownCommandError(commandName);
    }
  } else if (isComment(line)) {
    return {
      type: "comment",
    };
  } else if (containsEqualSymbol(line)) {
    // TODO: it assumes the line contains at most one "=", but we should consider multiple assignments.
    const [aliasIdentifier, commandExpression] = line.split("=").map((str) =>
      str.trim()
    );
    return {
      type: "assign",
      aliasIdentifier,
      commandExpression,
    };
  } else {
    return {
      type: "validate",
      expression: line,
    };
  }
}

function startsWithUpperCase(str: string): boolean {
  return /^[A-Z]/.test(str);
}

function isComment(str: string): boolean {
  return /^#/.test(str);
}

function includesLineBreak(str: string): boolean {
  return /\n/.test(str);
}

function containsEqualSymbol(str: string): boolean {
  return /=/.test(str);
}
