import { Token, TokenType } from "./token.ts";

export type Lexer = {
  source: string;
  pos: number;
  line: number;
  column: number;
};

export function createLexer(source: string): Lexer {
  return {
    source,
    pos: 0,
    line: 1,
    column: 1,
  };
}

export function resetLexer(lexer: Lexer): void {
  lexer.pos = 0;
  lexer.line = 1;
  lexer.column = 1;
}

const isWhitespace = (char: string) => /\s/.test(char);
const isDigit = (char: string) => /[0-9]/.test(char);

function peek(lexer: Lexer): string {
  return lexer.source[lexer.pos] ?? "\0";
}

function advance(lexer: Lexer): string {
  const char = peek(lexer);
  lexer.pos++;
  if (char === "\n") {
    lexer.line++;
    lexer.column = 1;
  } else {
    lexer.column++;
  }

  return char;
}

function isAtEnd(lexer: Lexer): boolean {
  return lexer.pos >= lexer.source.length;
}

function makeToken(lexer: Lexer, type: TokenType, lexeme: string): Token {
  return { type, lexeme, line: lexer.line, column: lexer.column - 1 };
}

function handleEscape(lexer: Lexer): void {
  const char = advance(lexer); // consume char after backslash
  switch (char) {
    case '"':
    case "\\":
    case "/":
    case "b":
    case "f":
    case "n":
    case "r":
    case "t":
      break;
    case "u":
      for (let i = 0; i < 4; i++) {
        const ch = advance(lexer);
        if (!/[0-9a-fA-F]/.test(ch)) {
          throw new Error(
            `Invalid Unicode escape at line ${lexer.line} column ${lexer.column}`
          );
        }
      }
      break;
    default:
      throw new Error(
        `Invalid escape character \\${char} at line ${lexer.line} column ${lexer.column}`
      );
  }
}

function stringToken(lexer: Lexer): Token {
  advance(lexer); // skip opening quote
  const start = lexer.pos;

  while (peek(lexer) !== '"' && !isAtEnd(lexer)) {
    if (peek(lexer) === "\\") {
      advance(lexer); // skip backslash
      handleEscape(lexer);
      continue;
    }
    advance(lexer);
  }

  if (advance(lexer) !== '"')
    throw new Error(
      `Unterminated string at line ${lexer.line} column ${lexer.column}`
    );

  // slice from start to just before closing quote
  const lexeme = lexer.source.slice(start, lexer.pos - 1);
  return makeToken(lexer, TokenType.STRING, lexeme);
}

function numberToken(lexer: Lexer): Token {
  const start = lexer.pos;
  while (isDigit(peek(lexer))) advance(lexer);
  if (peek(lexer) === ".") {
    advance(lexer);
    while (isDigit(peek(lexer))) advance(lexer);
  }
  const lexeme = lexer.source.slice(start, lexer.pos);
  return makeToken(lexer, TokenType.NUMBER, lexeme);
}

export function tokenize(lexer: Lexer): Token[] {
  const tokens: Token[] = [];

  while (!isAtEnd(lexer)) {
    const char = peek(lexer);

    if (isWhitespace(char)) {
      advance(lexer);
      continue;
    }

    switch (char) {
      case "(":
        tokens.push(makeToken(lexer, TokenType.LEFT_PAREN, advance(lexer)));
        continue;
      case ")":
        tokens.push(makeToken(lexer, TokenType.RIGHT_PAREN, advance(lexer)));
        continue;
      case "[":
        tokens.push(makeToken(lexer, TokenType.LEFT_BRACKET, advance(lexer)));
        continue;
      case "]":
        tokens.push(makeToken(lexer, TokenType.RIGHT_BRACKET, advance(lexer)));
        continue;
      case "{":
        tokens.push(makeToken(lexer, TokenType.LEFT_BRACE, advance(lexer)));
        continue;
      case "}":
        tokens.push(makeToken(lexer, TokenType.RIGHT_BRACE, advance(lexer)));
        continue;
      case ":":
        tokens.push(makeToken(lexer, TokenType.COLON, advance(lexer)));
        continue;
      case ",":
        tokens.push(makeToken(lexer, TokenType.COMMA, advance(lexer)));
        continue;
      case "+":
        tokens.push(makeToken(lexer, TokenType.PLUS, advance(lexer)));
        continue;
      case "-":
        tokens.push(makeToken(lexer, TokenType.MINUS, advance(lexer)));
        continue;
      case "*":
        tokens.push(makeToken(lexer, TokenType.STAR, advance(lexer)));
        continue;
      case "/":
        tokens.push(makeToken(lexer, TokenType.SLASH, advance(lexer)));
        continue;
      case "^":
        tokens.push(makeToken(lexer, TokenType.CARET, advance(lexer)));
        continue;
      case "!":
        tokens.push(makeToken(lexer, TokenType.BANG, advance(lexer)));
        continue;
      case '"':
        tokens.push(stringToken(lexer));
        continue;
      default:
        if (isDigit(char)) {
          tokens.push(numberToken(lexer));
          continue;
        }
        if (lexer.source.startsWith("true", lexer.pos)) {
          tokens.push(makeToken(lexer, TokenType.TRUE, "true"));
          lexer.pos += 4;
          continue;
        }
        if (lexer.source.startsWith("false", lexer.pos)) {
          tokens.push(makeToken(lexer, TokenType.FALSE, "false"));
          lexer.pos += 5;
          continue;
        }
        if (lexer.source.startsWith("null", lexer.pos)) {
          tokens.push(makeToken(lexer, TokenType.NULL, "null"));
          lexer.pos += 4;
          continue;
        }
        throw new Error(
          `Unexpected character '${char}' at line ${lexer.line}, column ${lexer.column}`
        );
    }
  }

  tokens.push(makeToken(lexer, TokenType.EOF, ""));
  return tokens;
}
