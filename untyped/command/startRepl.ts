import { Repl } from "./repl.ts";

export function startRepl(): void {
  const repl = new Repl();

  console.log("Lambda calculus");
  console.log("exit using ctrl+c or EXIT");
  while (true) {
    const line = prompt(">") ?? "";
    const out = repl.eval(line);
    if (out) {
      console.log(out);
    }
    // Reset cursor position
    Deno.stdout.writeSync(new TextEncoder().encode("\r"));
  }
}
