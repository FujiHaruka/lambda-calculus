import { ExpressionAlias } from "../alias/alias.ts";
import { BuiltinAliasesMap } from "../alias/builtin.ts";
import { assertNever } from "../utils.ts";
import { executeReduceCommand, executeValidateCommand } from "./commands.ts";
import { parseCommand } from "./parseCommand.ts";

export class Repl {
  aliases = new Map<string, ExpressionAlias>(
    BuiltinAliasesMap.entries(),
  );

  eval(line: string): string {
    try {
      const command = parseCommand(line);

      switch (command.type) {
        case "empty":
          return "";
        case "exit":
          return Deno.exit(0);
        case "validate":
          return executeValidateCommand(command.expression, this.aliases);
        case "reduce":
          return executeReduceCommand(command.expression, this.aliases);
        case "assign": {
          const result = executeValidateCommand(
            command.expression,
            this.aliases,
          );
          this.aliases.set(
            command.aliasIdentifier,
            new ExpressionAlias({
              identifier: command.aliasIdentifier,
              expression: command.expression,
            }),
          );
          return result;
        }
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
