export type TokenType = "var";

export type ScanResult = {
  type: TokenType;
  start: number;
  end: number;
} | null;
