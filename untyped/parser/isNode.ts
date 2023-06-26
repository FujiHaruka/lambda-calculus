import { assertNever } from "../utils.ts";
import { Node, PartialNode } from "./types.ts";

export function isNode(partialNode: PartialNode): partialNode is Node {
  switch (partialNode.type) {
    case "abstraction": {
      if (!partialNode.body) {
        return false;
      }
      return true;
    }
    case "application": {
      if (!partialNode.right) {
        return false;
      }
      return true;
    }
    case "var": {
      return true;
    }
    case "any": {
      return false;
    }
    default: {
      assertNever(partialNode);
    }
  }

  // unreachable
  return false;
}
