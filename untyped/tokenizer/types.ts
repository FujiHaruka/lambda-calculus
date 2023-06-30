export type TokenType = "var" | "left_paren" | "right_paren" | "arrow" | "eof";

export type Token = Readonly<{
  type: TokenType;
  start: number;
  end: number;
}>;

export type ScanResult = Token | null;
