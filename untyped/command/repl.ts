import { assertNever } from "../utils.ts";
import { executeReduceCommand, executeValidateCommand } from "./commands.ts";
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
        case "assign":
          return "TODO";
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
