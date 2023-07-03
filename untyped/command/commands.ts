import { BuiltinAliasesMap } from "../alias/builtin.ts";
import { unfoldAliases } from "../alias/unfold.ts";
import { performBetaReductionUntilDone } from "../beta/betaReduction.ts";
import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";

export function executeReduceCommand(expression: string): string {
  const node = parse(expression);
  const unfoleded = unfoldAliases(node, BuiltinAliasesMap);
  const reductionHistory = performBetaReductionUntilDone(unfoleded);
  return reductionHistory.map(stringify).join("\n");
}

export function executeValidateCommand(expression: string): string {
  const node = parse(expression);
  const unfoleded = unfoldAliases(node, BuiltinAliasesMap);
  return stringify(unfoleded);
}
