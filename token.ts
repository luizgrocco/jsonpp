export const TokenType = {
  LEFT_PAREN: "LEFT_PAREN", // (
  RIGHT_PAREN: "RIGHT_PAREN", // )
  LEFT_BRACKET: "LEFT_BRACKET", // [
  RIGHT_BRACKET: "RIGHT_BRACKET", // ]
  LEFT_BRACE: "LEFT_BRACE", // {
  RIGHT_BRACE: "RIGHT_BRACE", // }
  COMMA: "COMMA",
  COLON: "COLON",
  PLUS: "PLUS",
  MINUS: "MINUS",
  STAR: "STAR", // *
  SLASH: "SLASH", // /
  CARET: "CARET", // ^
  BANG: "BANG",
  STRING: "STRING",
  NUMBER: "NUMBER",
  TRUE: "TRUE",
  FALSE: "FALSE",
  NULL: "NULL",
  EOF: "EOF",
} as const;

export type TokenType = keyof typeof TokenType;

export type Token = {
  type: TokenType;
  lexeme: string;
  line: number;
  column: number;
};
