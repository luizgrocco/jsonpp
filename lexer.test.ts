import { assertEquals, assertThrows } from "@std/assert";
import { createLexer, tokenize } from "./lexer.ts";
import { TokenType } from "./token.ts";

function runTokenizer(source: string) {
  const lexer = createLexer(source);
  return tokenize(lexer);
}

Deno.test("single characters", () => {
  const tokens = runTokenizer("{}[]:,+-*/!");
  const types = tokens.map(t => t.type);
  assertEquals(types, [
    TokenType.LEFT_BRACE,
    TokenType.RIGHT_BRACE,
    TokenType.LEFT_BRACKET,
    TokenType.RIGHT_BRACKET,
    TokenType.COLON,
    TokenType.COMMA,
    TokenType.PLUS,
    TokenType.MINUS,
    TokenType.STAR,
    TokenType.SLASH,
    TokenType.BANG,
    TokenType.EOF,
  ]);
});

Deno.test("numbers", () => {
  const tokens = runTokenizer("42 -5 3.14 -0.001 123.456");
  const lexemes = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.lexeme);
  assertEquals(lexemes, ["42", "-", "5", "3.14", "-", "0.001", "123.456"]);
});

Deno.test("numbers with operators", () => {
  const tokens = runTokenizer("-5 * 1 / +3");
  const types = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.type);
  assertEquals(types, [
    TokenType.MINUS,
    TokenType.NUMBER,
    TokenType.STAR,
    TokenType.NUMBER,
    TokenType.SLASH,
    TokenType.PLUS,
    TokenType.NUMBER,
  ]);
});

Deno.test("strings simple", () => {
  const tokens = runTokenizer('"hello" "world"');
  const lexemes = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(t => t.lexeme);
  assertEquals(lexemes, ["hello", "world"]);
});

Deno.test("boolean and null literals", () => {
  const tokens = runTokenizer("true false null");
  const types = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.type);
  assertEquals(types, [TokenType.TRUE, TokenType.FALSE, TokenType.NULL]);
});

Deno.test("mixed JSON snippet", () => {
  const json = `
  {
    "num": -42,
    "arr": [1, 2, 3],
    "obj": {"a": true, "b": null},
    "str": "Hello World"
  }
  `;
  const tokens = runTokenizer(json);
  const lexemes = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.lexeme);
  assertEquals(lexemes, [
    "{",
    "num",
    ":",
    "-",
    "42",
    ",",
    "arr",
    ":",
    "[",
    "1",
    ",",
    "2",
    ",",
    "3",
    "]",
    ",",
    "obj",
    ":",
    "{",
    "a",
    ":",
    "true",
    ",",
    "b",
    ":",
    "null",
    "}",
    ",",
    "str",
    ":",
    "Hello World",
    "}",
  ]);
});

Deno.test("escaped backslash", () => {
  const source = '{ "key": "value\\\\" }';
  const tokens = runTokenizer(source);
  const lexemes = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.lexeme);

  assertEquals(lexemes, ["{", "key", ":", "value\\\\", "}"]);
});

Deno.test("new line in strings", () => {
  const source = '{ "key": "value\nvalue" }';
  const tokens = runTokenizer(source);
  const lexemes = tokens
    .filter(token => token.type !== TokenType.EOF)
    .map(token => token.lexeme);

  assertEquals(lexemes, ["{", "key", ":", "value\nvalue", "}"]);
});

Deno.test("unterminated string with EOF", () => {
  assertThrows(
    () => runTokenizer('"This string never ends'),
    Error,
    "Unterminated string"
  );
});

Deno.test("unterminated string inside JSON object", () => {
  const source = '{ "key": "value';
  assertThrows(() => runTokenizer(source), Error, "Unterminated string");
});
