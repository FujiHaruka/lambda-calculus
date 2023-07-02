import {
  CommandArgumentExpectedError,
  CommandArgumentUnexpectedError,
  CommandExpectedError,
  UnknownCommandError,
} from "./errors.ts";
import { Command } from "./types.ts";

const Commands = {
  EXIT: "EXIT",
  REDUCE: "REDUCE",
  REDUCE_V: "REDUCE_V",
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
        case Commands.REDUCE:
        case Commands.REDUCE_V:
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
      case Commands.REDUCE_V:
        return { type: "reduce_verbose", expression: arg };
      case Commands.EXIT:
        throw new CommandArgumentUnexpectedError(commandName);
      default:
        throw new UnknownCommandError(commandName);
    }
  } else {
    throw new Error("Not implemented yet");
  }
}

function startsWithUpperCase(str: string): boolean {
  return /^[A-Z]/.test(str);
}

function includesLineBreak(str: string): boolean {
  return /\n/.test(str);
}
