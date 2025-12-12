import { ASTNode } from "./ast.ts";
import { createLexer, tokenize } from "./lexer.ts";
import { createParser, parse } from "./parser.ts";

function runParser(source: string): ASTNode {
  const lexer = createLexer(source);
  const tokens = tokenize(lexer);
  const parser = createParser(tokens);
  return parse(parser);
}

// console.dir(runParser("1 + 5 ^ 2 * 4 + 2 ^ 3"), { depth: null });
// console.dir(runParser("10 * 9 * 8 * 7 + 6"), { depth: null });
// console.dir(runParser("10 ^ 9 ^ 8 ^ 7 ^ 6 ^ 5"), { depth: null });
// console.dir(runParser("+10 * +9"), { depth: null });
console.dir(runParser("9"), { depth: null });
