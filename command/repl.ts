import { ExpressionAlias } from "../alias/alias.ts";
import { BuiltinAliasesMap } from "../alias/builtin.ts";
import { unfoldAliases } from "../alias/unfold.ts";
import { isAlphaEquivalent } from "../alpha/alphaEquivalence.ts";
import { performBetaReductionUntilDone } from "../beta/betaReduction.ts";
import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";
import { assertNever } from "../utils.ts";
import { UnsupportedRightHandSideCommandError } from "./errors.ts";
import { parseCommand } from "./parseCommand.ts";
import {
  AlphaEquivalentCommand,
  AssignCommand,
  ReduceCommand,
  ValidateCommand,
} from "./types.ts";

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
          return this.#executeValidateCommand(command);
        case "reduce":
          return this.#executeReduceCommand(command).join("\n");
        case "eq":
          return this.#executeAlphaEquivalentCommand(command);
        case "assign":
          return this.#executeAssignCommand(command);
        case "comment":
          return "";
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

  #executeValidateCommand({ expression }: ValidateCommand): string {
    const node = parse(expression);
    const unfoleded = unfoldAliases(node, this.aliases);
    return stringify(unfoleded);
  }

  #executeReduceCommand({ expression }: ReduceCommand): string[] {
    const node = parse(expression);
    const unfoleded = unfoldAliases(node, this.aliases);
    const reductionHistory = performBetaReductionUntilDone(unfoleded);
    if (reductionHistory.length === 0) {
      throw new Error("No reduction history");
    }

    return reductionHistory.map(stringify);
  }

  #executeAlphaEquivalentCommand(command: AlphaEquivalentCommand): string {
    const { expressionA, expressionB } = command;
    const nodeA = parse(expressionA);
    const nodeB = parse(expressionB);
    const unfolededA = unfoldAliases(nodeA, this.aliases);
    const unfolededB = unfoldAliases(nodeB, this.aliases);
    return isAlphaEquivalent(unfolededA, unfolededB) ? "Yes" : "No";
  }

  #executeAssignCommand(command: AssignCommand): string {
    const { commandExpression, aliasIdentifier } = command;
    const rightCommand = parseCommand(commandExpression);

    const {
      result,
      expression,
    } = (() => {
      switch (rightCommand.type) {
        case "validate": {
          return {
            result: this.#executeValidateCommand(rightCommand),
            expression: rightCommand.expression,
          };
        }
        case "reduce": {
          const history = this.#executeReduceCommand(rightCommand);
          return {
            result: history.join("\n"),
            expression: history.at(-1)!,
          };
        }
        default: {
          throw new UnsupportedRightHandSideCommandError(rightCommand.type);
        }
      }
    })();

    this.aliases.set(
      command.aliasIdentifier,
      new ExpressionAlias({
        identifier: aliasIdentifier,
        expression,
      }),
    );

    return result;
  }
}
