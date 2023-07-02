import { ExpressionAlias } from "./alias.ts";

export const BuiltinAliases: ExpressionAlias[] = [
  {
    identifier: "$TRUE",
    expression: "t -> (f -> t)",
  },
  {
    identifier: "$FALSE",
    expression: "t -> (f -> f)",
  },
  {
    identifier: "$AND",
    expression: "p -> (q -> (p q $FALSE))",
  },
  {
    identifier: "$OR",
    expression: "p -> (q -> (p $TRUE q))",
  },
  {
    identifier: "$NOT",
    expression: "p -> (p $FALSE $TRUE)",
  },
].map((alias) => new ExpressionAlias(alias));

export const BuiltinAliasesMap = new Map(
  BuiltinAliases.map((alias) => [alias.identifier, alias]),
);
