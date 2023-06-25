export type TokenType = "var" | "left_paren" | "right_paren";

export type ScanResult = {
  type: TokenType;
  start: number;
  end: number;
} | null;
