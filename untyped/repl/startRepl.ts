import { readLines } from "./deps.ts";
import { Repl } from "./repl.ts";

export async function startRepl() {
  const repl = new Repl();

  console.log("Lambda calculus");
  console.log("exit using ctrl+c, ctrl+d, or EXIT");
  printHead();
  for await (const line of readLines(Deno.stdin)) {
    const out = repl.eval(line);
    if (out) {
      console.log(out);
    }
    printHead();
  }
}

function printHead() {
  Deno.stdout.write(new TextEncoder().encode("> "));
}
