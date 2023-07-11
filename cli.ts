import { executeFile } from "./command/executeFile.ts";
import { startRepl } from "./command/startRepl.ts";

if (Deno.args.length === 0) {
  startRepl();
} else if (Deno.args.length === 1) {
  const arg = Deno.args[0];
  if (arg.startsWith("-")) {
    showHelp();
  } else {
    try {
      const file = await Deno.readTextFile(arg);
      const exitCode = executeFile(file);
      Deno.exit(exitCode);
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      console.error(`${err.name}: ${err.message}`);
      Deno.exit(1);
    }
  }
} else {
  showHelp();
}

function showHelp() {
  console.log(`
Usage:
  To open REPL:
  $ lambda

  To execute file:
  $ lambda <file>
`);
}
