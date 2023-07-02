import { assertEquals, assertThrows, it } from "../testUtils.ts";
import {
  CommandArgumentExpectedError,
  CommandArgumentUnexpectedError,
  CommandExpectedError,
  UnknownCommandError,
} from "./errors.ts";
import { parseCommand } from "./parseCommand.ts";

it("returns empty command for empty input", () => {
  assertEquals(parseCommand(""), { type: "empty" });
});

it("returns exit command for EXIT", () => {
  assertEquals(parseCommand("EXIT"), { type: "exit" });
});

it("returns reduce command for REDUCE", () => {
  assertEquals(parseCommand("REDUCE x -> y"), {
    type: "reduce",
    expression: "x -> y",
  });
});

it("returns reduce_verbose command for REDUCE_V", () => {
  assertEquals(parseCommand("REDUCE_V x -> y"), {
    type: "reduce_verbose",
    expression: "x -> y",
  });
});

it("trims input", () => {
  assertEquals(parseCommand("  EXIT  "), { type: "exit" });
});

it("throws for unknown command", () => {
  assertThrows(() => parseCommand("UNKNOWN_COMMAND"), UnknownCommandError);
});

it("throws for unknown command with arg", () => {
  assertThrows(
    () => parseCommand("UNKNOWN_COMMAND x -> y"),
    UnknownCommandError,
  );
});

it("throws for not likely command", () => {
  assertThrows(() => parseCommand("FOO!"), CommandExpectedError);
});

it("throws for non-arg command with arg", () => {
  assertThrows(
    () => parseCommand("EXIT x -> y"),
    CommandArgumentUnexpectedError,
  );
});

it("throws for arg command without arg", () => {
  assertThrows(() => parseCommand("REDUCE"), CommandArgumentExpectedError);
});

it("throws for mult-line input", () => {
  assertThrows(() => parseCommand("x\ny"));
});
