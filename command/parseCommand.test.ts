import { assertEquals, assertThrows, it } from "../utils/testUtils.ts";
import {
  CommandArgumentExpectedError,
  CommandArgumentUnexpectedError,
  CommandExpectedError,
  CommandUnexpectedArgumentsError,
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

it("returns eq command for ALPHA_EQ", () => {
  assertEquals(parseCommand("ALPHA_EQ x -> y, y -> x"), {
    type: "eq",
    expressionA: "x -> y",
    expressionB: "y -> x",
  });
});

it("returns validate command if the line does not starts with upper case letter", () => {
  assertEquals(parseCommand("x -> y"), {
    type: "validate",
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

it("throws for ALPHA_EQ without args", () => {
  assertThrows(() => parseCommand("ALPHA_EQ"), CommandArgumentExpectedError);
});

it("throws for ALPHA_EQ with one arg", () => {
  assertThrows(
    () => parseCommand("ALPHA_EQ x -> y"),
    CommandUnexpectedArgumentsError,
  );
});

it("throws for ALPHA_EQ with more than two args", () => {
  assertThrows(
    () => parseCommand("ALPHA_EQ x, y, z"),
    CommandUnexpectedArgumentsError,
  );
});
