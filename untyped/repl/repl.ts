import { assertNever } from "../utils.ts";
import {
  executeReduceCommand,
  executeReduceVerboseCommand,
  executeValidateCommand,
} from "./commands.ts";
import { parseCommand } from "./parseCommand.ts";

export class Repl {
  eval(line: string): string {
    try {
      const command = parseCommand(line);

      switch (command.type) {
        case "empty":
          return "";
        case "exit":
          return Deno.exit(0);
        case "validate":
          return executeValidateCommand(command.expression);
        case "reduce":
          return executeReduceCommand(command.expression);
        case "reduce_verbose":
          return executeReduceVerboseCommand(command.expression);
        default: {
          assertNever(command);
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof Error)) {
        throw err;
      }

      return `${err.name}: ${err.message}`;
    }
  }
}
