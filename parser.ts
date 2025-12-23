import {
  type ASTNode,
  type Operator,
  UnaryOperators,
  BinaryOperators,
  createArrayNode,
  createLiteralNode,
  createObjectNode,
  createObjectProperty,
  createUnaryNode,
  ExpressionNode,
} from "./ast.ts";
import { Token, TokenType } from "./token.ts";

export type Parser = {
  tokens: Token[];
  pos: number;
  bindingPowers: Partial<Record<TokenType, number>>;
  nud: Map<TokenType, NudFn>;
  led: Map<TokenType, LedFn>;
};

type NudFn = (parser: Parser, token: Token) => ExpressionNode;
type LedFn = (
  parser: Parser,
  left: ExpressionNode,
  token: Token
) => ExpressionNode;

const precedence: Record<Operator, number> = {
  [UnaryOperators.BANG]: 80,
  [UnaryOperators.MINUS]: 80,
  [UnaryOperators.PLUS]: 80,
  [BinaryOperators.EXPONENT]: 70,
  [BinaryOperators.DIVIDES]: 60,
  [BinaryOperators.TIMES]: 60,
  [BinaryOperators.PLUS]: 50,
  [BinaryOperators.MINUS]: 50,
};

const bindingPowers: Partial<Record<TokenType, number>> = {
  [TokenType.CARET]: precedence[BinaryOperators.EXPONENT],
  [TokenType.SLASH]: precedence[BinaryOperators.DIVIDES],
  [TokenType.STAR]: precedence[BinaryOperators.TIMES],
  [TokenType.MINUS]: precedence[BinaryOperators.MINUS],
  [TokenType.PLUS]: precedence[BinaryOperators.PLUS],
};

const nud = new Map<TokenType, NudFn>([
  [
    TokenType.NUMBER,
    (_parser, token) => createLiteralNode(Number(token.lexeme), token),
  ],
  [
    TokenType.STRING,
    (_parser, token) => createLiteralNode(token.lexeme, token),
  ],
  [TokenType.TRUE, (_parser, token) => createLiteralNode(true, token)],
  [TokenType.FALSE, (_parser, token) => createLiteralNode(false, token)],
  [TokenType.NULL, (_parser, token) => createLiteralNode(null, token)],
  [
    TokenType.BANG,
    (parser, token) =>
      createUnaryNode(
        UnaryOperators.BANG,
        parseExpression(parser, precedence[UnaryOperators.BANG]),
        token
      ),
  ],
  [
    TokenType.PLUS,
    (parser, token) =>
      createUnaryNode(
        UnaryOperators.PLUS,
        parseExpression(parser, precedence[UnaryOperators.PLUS]),
        token
      ),
  ],
  [
    TokenType.MINUS,
    (parser, token) =>
      createUnaryNode(
        UnaryOperators.MINUS,
        parseExpression(parser, precedence[UnaryOperators.MINUS]),
        token
      ),
  ],
  [
    TokenType.LEFT_PAREN,
    (parser, _token) => {
      const expr = parseExpression(parser);
      const end = advance(parser);
      if (end.type !== TokenType.RIGHT_PAREN)
        throw new Error(
          `Expected ) at line ${end.line} column ${end.column}, got ${end.lexeme}`
        );
      return expr;
    },
  ],
  [
    TokenType.LEFT_BRACKET,
    (parser, token) => {
      const startToken = token;
      const arrayElements: ASTNode[] = [];

      let next = peek(parser);
      while (!isAtEnd(parser) && next.type !== TokenType.RIGHT_BRACKET) {
        const expr = parseExpression(parser);
        arrayElements.push(expr);

        next = peek(parser);
        // If there's a closing bracket, array has finished, break.
        if (next.type === TokenType.RIGHT_BRACKET) {
          break;
        }
        // If there's a comma, consume it and keep going.
        if (next.type === TokenType.COMMA) {
          advance(parser); // Consume the comma
          continue;
        }
        // If neither, there's a parsing error.
        throw new Error(
          `Expected ',' at line ${next.line} column ${next.column}, got ${next.lexeme}`
        );
      }

      const endToken = advance(parser); // Consume the RIGHT_BRACKET
      if (endToken.type !== TokenType.RIGHT_BRACKET) {
        throw new Error(
          `Expected ']' at line ${endToken.line} column ${endToken.column}, got ${endToken.lexeme}`
        );
      }

      return createArrayNode(arrayElements, startToken, endToken);
    },
  ],
  [
    TokenType.LEFT_BRACE,
    (parser, token) => {
      const startToken = token; // Consume left brace

      const properties = [];

      let next = peek(parser);
      while (!isAtEnd(parser) && next.type !== TokenType.RIGHT_BRACE) {
        const propertyName = parseExpression(parser);

        next = advance(parser);
        if (next.type !== TokenType.COLON) {
          throw new Error(
            `Expected ':' at line ${next.line} column ${next.column}, got ${next.lexeme}`
          );
        }
        const expr = parseExpression(parser);

        const property = createObjectProperty(propertyName, expr);
        properties.push(property);

        // If there's a closing brace, object has finished, break.
        next = peek(parser);
        if (next.type === TokenType.RIGHT_BRACE) {
          break;
        }
        // If there's a comma, consume it and keep going.
        if (next.type === TokenType.COMMA) {
          advance(parser); // Consume the comma
          continue;
        }
        // If neither, there's a parsing error.
        throw new Error(
          `Expected ',' at line ${next.line} column ${next.column}, got ${next.lexeme}`
        );
      }

      const endToken = advance(parser); // Consume the RIGHT_BRACE
      if (endToken.type !== TokenType.RIGHT_BRACE) {
        throw new Error(
          `Expected '}' at line ${endToken.line} column ${endToken.column}, got ${endToken.lexeme}`
        );
      }

      return createObjectNode(properties, startToken, endToken);
    },
  ],
]);

const led = new Map<TokenType, LedFn>([
  [
    TokenType.PLUS,
    (parser, left, token) => ({
      type: "Binary",
      operator: BinaryOperators.PLUS,
      left,
      right: parseExpression(parser, precedence[BinaryOperators.PLUS]),
      token,
    }),
  ],
  [
    TokenType.MINUS,
    (parser, left, token) => ({
      type: "Binary",
      operator: BinaryOperators.MINUS,
      left,
      right: parseExpression(parser, precedence[BinaryOperators.MINUS]),
      token,
    }),
  ],
  [
    TokenType.STAR,
    (parser, left, token) => ({
      type: "Binary",
      operator: BinaryOperators.TIMES,
      left,
      right: parseExpression(parser, precedence[BinaryOperators.TIMES]),
      token,
    }),
  ],
  [
    TokenType.SLASH,
    (parser, left, token) => ({
      type: "Binary",
      operator: BinaryOperators.DIVIDES,
      left,
      right: parseExpression(parser, precedence[BinaryOperators.DIVIDES]),
      token,
    }),
  ],
  [
    TokenType.CARET,
    (parser, left, token) => ({
      type: "Binary",
      operator: BinaryOperators.EXPONENT,
      left,
      right: parseExpression(parser, precedence[BinaryOperators.EXPONENT] - 1),
      token,
    }),
  ],
]);

export function createParser(tokens: Token[]): Parser {
  return {
    tokens,
    pos: 0,
    bindingPowers,
    nud,
    led,
  };
}

function resetParser(parser: Parser) {
  parser.pos = 0;
}

function peek(parser: Parser): Token {
  return parser.tokens[parser.pos];
}

function isAtEnd(parser: Parser): boolean {
  return parser.pos >= parser.tokens.length;
}

function advance(parser: Parser): Token {
  return parser.tokens[parser.pos++];
}

function parseExpression(parser: Parser, rbp = 0): ExpressionNode {
  const token = advance(parser);

  const nudFn = parser.nud.get(token.type);
  if (!nudFn)
    throw new Error(
      `Expected expression at line ${token.line} column ${token.column}, got ${token.lexeme}`
    );

  let left = nudFn(parser, token);
  let next = peek(parser);

  while ((parser.bindingPowers[next.type] ?? 0) > rbp) {
    const ledFn = parser.led.get(next.type);
    if (!ledFn)
      throw new Error(
        `Expected operator at line ${next.line} column ${next.column}, got ${next.lexeme} `
      );
    advance(parser);
    left = ledFn(parser, left, next);
    next = peek(parser);
  }

  return left;
}

export function parse(parser: Parser): ASTNode {
  resetParser(parser);

  const result = parseExpression(parser);

  return result;
}
