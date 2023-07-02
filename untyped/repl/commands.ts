import { performBetaReductionUntilDone } from "../beta/betaReduction.ts";
import { parse } from "../parse.ts";
import { stringify } from "../stringify.ts";

export function executeReduceCommand(expression: string): string {
  const node = parse(expression);
  const reductionHistory = performBetaReductionUntilDone(node);
  if (reductionHistory.length === 0) {
    throw new Error("Unexpected empty reduction history");
  } else {
    return stringify(reductionHistory[reductionHistory.length - 1]);
  }
}

export function executeReduceVerboseCommand(expression: string): string {
  const node = parse(expression);
  const reductionHistory = performBetaReductionUntilDone(node);
  return reductionHistory.map(stringify).join("\n");
}
