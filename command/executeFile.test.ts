import { assertSnapshot, it, path, walkSync } from "../testUtils.ts";
import { executeFile } from "./executeFile.ts";

const fixtureDir = path.resolve(
  path.dirname(path.fromFileUrl(import.meta.url)),
  "../fixtures",
);
const fixtures = walkSync(fixtureDir, { maxDepth: 1, exts: [".lambda"] });

for (const fixture of fixtures) {
  const fileName = path.basename(fixture.path);
  it(`executes ${fileName}`, async (t) => {
    const code = await Deno.readTextFile(fixture.path);
    const consoleOutput: string[] = [];
    const print = (str: string) => consoleOutput.push(str);
    executeFile(code, print);
    await assertSnapshot(t, consoleOutput);
  });
}
