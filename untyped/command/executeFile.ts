import { Repl } from "./repl.ts";

export function executeFile(script: string): void {
  const repl = new Repl();

  const lines = script.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    console.log(`> ${line}`);
    const out = repl.eval(line);
    if (out) {
      console.log(out);
    }
  }
}
