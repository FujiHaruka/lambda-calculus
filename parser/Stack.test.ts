import { assertThrows } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { assertEquals, it } from "../utils/testUtils.ts";
import { Stack } from "./Stack.ts";

it("pushes and pops", () => {
  const stack = new Stack<number>();
  stack.push(1);
  stack.push(2);
  stack.push(3);

  assertEquals(stack.pop(), 3);
  assertEquals(stack.pop(), 2);
  assertEquals(stack.pop(), 1);
});

it("throws when popping empty stack", () => {
  const stack = new Stack<number>();
  assertEquals(stack.size, 0);
  assertEquals(stack.empty(), true);
  assertEquals(stack.top(), null);
  assertEquals(stack.dump(), []);
  assertThrows(() => stack.pop());
});

it("returns top", () => {
  const stack = new Stack<number>();
  assertEquals(stack.top(), null);
  stack.push(1);
  assertEquals(stack.top(), 1);
  stack.push(2);
  assertEquals(stack.top(), 2);
});

it("returns size", () => {
  const stack = new Stack<number>();
  assertEquals(stack.size, 0);
  stack.push(1);
  assertEquals(stack.size, 1);
  stack.push(2);
  assertEquals(stack.size, 2);
});

it("dumps", () => {
  const stack = new Stack<number>();
  stack.push(1);
  stack.push(2);
  stack.push(3);
  assertEquals(stack.dump(), [1, 2, 3]);
});

it("empty() returns true if empty", () => {
  const stack = new Stack<number>();
  assertEquals(stack.empty(), true);
  stack.push(1);
  assertEquals(stack.empty(), false);
});
