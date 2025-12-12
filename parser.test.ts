import { assertEquals, assertThrows } from "@std/assert";
import { createParser, parse } from "./parser.ts";
import { createLexer, tokenize } from "./lexer.ts";
import { ASTNode } from "./ast.ts";
import { TokenType } from "./token.ts";

function runParser(source: string): ASTNode {
  const lexer = createLexer(source);
  const tokens = tokenize(lexer);
  const parser = createParser(tokens);
  return parse(parser);
}
