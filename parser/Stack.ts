export class Stack<T> {
  #items: T[] = [];

  get size(): number {
    return this.#items.length;
  }

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

  push(item: T): void {
    this.#items.push(item);
  }

  dump(): T[] {
    return [...this.#items];
  }
}
