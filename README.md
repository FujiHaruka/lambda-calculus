# REPL for lambda calculus

This project provides a Read-Eval-Print Loop (REPL) command line tool for lambda
calculus, designed to make your learning experience interactive and intuitive.
Whether you're an experienced programmer or just starting, this tool is your
companion in exploring the complex world of lambda calculus.

## Installation

This tool requires [Deno](https://deno.land/) as its runtime environment.

You can install the tool using the following command.

```
$ deno install -n lambda https://deno.land/x/lambdacalculus/cli.ts
```

## Usage

To enter the REPL, simply type:

```
$ lambda
```

### Syntax

While traditional notation for lambda calculus uses `λ` as in `λx.x`, this tool
adopts the more keyboard-friendly `x -> x` notation for easier typing.

For instance, `λp.((p λt.λf.f) (λt.λf.t))` can be written as follows:

```
p -> ((p (t -> (f -> f))) (t -> (f -> t)))
```

Moreover, our tool supports optional parentheses, allowing for cleaner and more
readable expressions:

- Parentheses can be omitted in sequences of lambda abstractions: `x -> y -> z`
  is equivalent to `(x -> (y -> z))`
- Application is left-associative: `M N L` is equivalent to `(M N) L`
- Application binds more tightly than lambda abstraction: `x -> y z` is
  equivalent to `x -> (y z)`

Utilizing these rules, our previous example expression can be streamlined as
follows:

```
p -> p (t -> f -> f) (t -> f -> t)
```

### REDUCE command

This command carries out beta reduction, a crucial operation in lambda calculus.

Here's how you can use it:

```
> REDUCE (t -> (f -> t)) x y
(((t -> (f -> t)) x) y)
((f -> x) y)
x
```

Just by typing `REDUCE` followed by your lambda expression, you can instantly
see the process of beta reduction unfold.

### ALPHA_EQ command

The ALPHA_EQ command checks whether two lambda expressions are alpha equivalent.

Here's a quick example of its usage:

```
> ALPHA_EQ x -> x, t -> t
Yes
```

Type `ALPHA_EQ` followed by the two lambda expressions separated by a comma, and
the tool will indicate if they are alpha equivalent by printing `Yes` or `No`.

### Alias

You have the ability to use an alias to assign lambda expressions as variables
for easier reference and usability. Alias names must begin with `$`.

Take a look at this example:

```
> $id = x -> x
> ALPHA_EQ $id, t -> t
Yes
```

By employing aliases, you can simplify your work with complex expressions,
enhancing readability and efficiency of your calculations.

### Builtin aliases

Our tool comes pre-loaded with a set of built-in aliases, making your lambda
calculus experience even smoother. These include ready-to-use expressions such
as booleans.

Here's an example:

```
> $x = REDUCE $OR $TRUE $FALSE
> ALPHA_EQ $x, $TRUE
Yes
```

You also have access to natural numbers and their operations:

```
> $x = REDUCE $PLUS $2 $3
> ALPHA_EQ $x, $5
Yes
```

To view all available built-in aliases, simply use the `LIST` command:

```
> LIST
```

For more examples, feel free to explore [fixtures/](./fixtures/). These built-in
aliases not only make common lambda calculus operations more convenient but also
allow you to focus on more complex concepts and computations.
