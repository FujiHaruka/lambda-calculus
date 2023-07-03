import { ExpressionAlias } from "../alias/alias.ts";
import { unfoldAliases } from "../alias/unfold.ts";
import { performBetaReductionUntilDone } from "../beta/betaReduction.ts";
import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";

export function executeReduceCommand(
  expression: string,
  aliases: Map<string, ExpressionAlias>,
): string {
  const node = parse(expression);
  const unfoleded = unfoldAliases(node, aliases);
  const reductionHistory = performBetaReductionUntilDone(unfoleded);
  return reductionHistory.map(stringify).join("\n");
}

export function executeValidateCommand(
  expression: string,
  aliases: Map<string, ExpressionAlias>,
): string {
  const node = parse(expression);
  const unfoleded = unfoldAliases(node, aliases);
  return stringify(unfoleded);
}
