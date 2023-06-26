export function assertNever(x: never) {
  throw new Error(`Unexpected object: ${String(x)}`);
}
