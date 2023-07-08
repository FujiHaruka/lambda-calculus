# REPL for lambda calculus

This project provides a Read-Eval-Print Loop (REPL) command line tool for lambda
calculus, an ideal tool to support your learning journey.

## How to install

This tool requires [Deno](https://deno.land/) as the runtime environment.

You can install the tool using the following command.

```
$ deno install -n lambda https://deno.land/x/lambda-calculus
```

## Usage

To enter the REPL, simply type:

```
$ lambda
```

### Syntax

Though standard notation for lambda calculus uses `λ`, as in `λx.x`, this tool
uses `x -> x` for easier typing.

For instance, `λp.((p λt.λf.f) (λt.λf.t))` can be written as follows:

```
p -> ((p (t -> (f -> f))) (t -> (f -> t)))
```

Additionally, you have the option to omit parentheses.

- Continuous lambda abstraction allows parentheses omission: `x -> y -> z` ==
  `(x -> (y -> z))`
- Application is left-associative: `M N L` == `(M N) L`
- Application has stronger binding than lambda abstraction: `x -> y z` ==
  `x -> (y z)`

### REDUCE command

This command performs beta reduction.

```
> REDUCE (t -> (f -> t)) x y
(((t -> (f -> t)) x) y)
((f -> x) y)
x
```

### ALPHA_EQ command

This command checks for alpha equivalence.

```
> ALPHA_EQ x -> x, t -> t
Yes
```

### Command: alias

You can use alias to treat lambda expressions as variables. Variable names must
start with `$`.

```
> $id = x -> x
> ALPHA_EQ $id, t -> t
Yes
> REDUCE $id $id
> REDUCE $id $id
((x -> x) (x -> x))
(x -> x)
```

### Builtin aliases

```
> $x = REDUCE $PLUS $2 $3
> ALPHA_EQ $x, $5
Yes
```
