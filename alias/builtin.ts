import { ExpressionAlias } from "./alias.ts";

export const BuiltinAliases: ExpressionAlias[] = [
  // Boolean
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
  {
    identifier: "$IF",
    expression: "p -> (a -> (b -> (p a b)))",
  },
  // Natural numbers
  {
    identifier: "$0",
    expression: "s -> (z -> z)",
  },
  {
    identifier: "$1",
    expression: "s -> (z -> (s z))",
  },
  {
    identifier: "$2",
    expression: "s -> (z -> (s (s z)))",
  },
  {
    identifier: "$3",
    expression: "s -> (z -> (s (s (s z))))",
  },
  {
    identifier: "$4",
    expression: "s -> (z -> (s (s (s (s z)))))",
  },
  {
    identifier: "$5",
    expression: "s -> (z -> (s (s (s (s (s z))))))",
  },
  {
    identifier: "$6",
    expression: "s -> (z -> (s (s (s (s (s (s z)))))))",
  },
  {
    identifier: "$7",
    expression: "s -> (z -> (s (s (s (s (s (s (s z))))))))",
  },
  {
    identifier: "$8",
    expression: "s -> (z -> (s (s (s (s (s (s (s (s z)))))))))",
  },
  {
    identifier: "$9",
    expression: "s -> (z -> (s (s (s (s (s (s (s (s (s z))))))))))",
  },
  // Arithmetic
  {
    identifier: "$IS_ZERO",
    expression: "n -> (n (k -> $FALSE) $TRUE)",
  },
  {
    identifier: "$SUCC",
    expression: "n -> (s -> (z -> (s (n s z))))",
  },
  {
    identifier: "$PLUS",
    expression: "m -> (n -> (s -> (z -> (m s (n s z)))))",
  },
  {
    identifier: "$MULT",
    expression: "m -> (n -> (n ($PLUS m) $0))",
  },
  {
    identifier: "$PRED",
    expression: "n -> f -> x -> (n (g -> (h -> (h (g f)))) (u -> x) (u -> u))",
  },
  {
    identifier: "$SUB",
    expression: "m -> (n -> ((n $PRED) m))",
  },
].map((alias) => new ExpressionAlias(alias));

export const BuiltinAliasesMap = new Map(
  BuiltinAliases.map((alias) => [alias.identifier, alias]),
);
