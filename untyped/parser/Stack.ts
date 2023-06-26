export class Stack<T> {
  #items: T[] = [];

  empty(): boolean {
    return this.#items.length === 0;
  }

  top(): T | null {
    return this.#items[this.#items.length - 1] ?? null;
  }

  pop(): T {
    const item = this.#items.pop();
    if (item === undefined) {
      throw new Error("Cannot pop. Stack is empty");
    }

    return item;
  }

  replaceTop(item: T): void {
    this.#items[this.#items.length - 1] = item;
  }

  push(item: T): void {
    this.#items.push(item);
  }

  bump(): T[] {
    return [...this.#items];
  }
}
