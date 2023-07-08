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
    usage: "$AND <boolean> <boolean>",
    example: "REDUCE $AND $TRUE $FALSE",
  },
  {
    identifier: "$OR",
    expression: "p -> (q -> (p $TRUE q))",
    usage: "$OR <boolean> <boolean>",
    example: "REDUCE $OR $TRUE $FALSE",
  },
  {
    identifier: "$NOT",
    expression: "p -> (p $FALSE $TRUE)",
    usage: "$NOT <boolean>",
    example: "REDUCE $NOT $TRUE",
  },
  {
    identifier: "$IF",
    expression: "p -> (a -> (b -> (p a b)))",
    usage: "$IF <boolean> <expression> <expression>",
    example: "REDUCE $IF $TRUE x y",
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
    usage: "$IS_ZERO <number>",
    example: "REDUCE $IS_ZERO $0",
  },
  {
    identifier: "$SUCC",
    expression: "n -> (s -> (z -> (s (n s z))))",
    usage: "$SUCC <number>",
    example: "REDUCE $SUCC $0",
  },
  {
    identifier: "$PLUS",
    expression: "m -> (n -> (s -> (z -> (m s (n s z)))))",
    usage: "$PLUS <number> <number>",
    example: "REDUCE $PLUS $1 $2",
  },
  {
    identifier: "$MULT",
    expression: "m -> (n -> (n ($PLUS m) $0))",
    usage: "$MULT <number> <number>",
    example: "REDUCE $MULT $2 $3",
  },
  {
    identifier: "$PRED",
    expression: "n -> f -> x -> (n (g -> (h -> (h (g f)))) (u -> x) (u -> u))",
    usage: "$PRED <number>",
    example: "REDUCE $PRED $2",
  },
  {
    identifier: "$SUB",
    expression: "m -> (n -> ((n $PRED) m))",
    usage: "$SUB <number> <number>",
    example: "REDUCE $SUB $3 $2",
  },
].map((alias) => new ExpressionAlias(alias));

export const BuiltinAliasesMap = new Map(
  BuiltinAliases.map((alias) => [alias.identifier, alias]),
);
