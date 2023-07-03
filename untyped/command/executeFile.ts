import { Repl } from "./repl.ts";

export function executeFile(
  script: string,
  print: (str: string) => void = console.log,
): void {
  const repl = new Repl();

  const lines = script.split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    print(`> ${line}`);
    const out = repl.eval(line);
    if (out) {
      print(out);
    }
  }
}
