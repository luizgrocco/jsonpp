import { Token } from "./token.ts";

type JsonPPValue = string | number | boolean | null;

export const Operators = {
  UNARY_PLUS: "UNARY_PLUS",
  UNARY_MINUS: "UNARY_MINUS",
  UNARY_BANG: "UNARY_BANG",
  BINARY_PLUS: "BINARY_PLUS",
  BINARY_MINUS: "BINARY_MINUS",
  BINARY_TIMES: "BINARY_TIMES",
  BINARY_DIVIDES: "BINARY_DIVIDES",
  BINARY_EXPONENT: "BINARY_EXPONENT",
} as const;

export type Operator = keyof typeof Operators;

type LiteralNode = {
  type: "Literal";
  value: JsonPPValue;
  token: Token;
};

export function createLiteralNode(
  value: JsonPPValue,
  token: Token
): LiteralNode {
  return {
    type: "Literal",
    value,
    token,
  };
}

type UnaryNode = {
  type: "Unary";
  operator: Operator;
  right: ExpressionNode;
  token: Token;
};

export function createUnaryNode(
  operator: Operator,
  right: ExpressionNode,
  token: Token
): UnaryNode {
  return {
    type: "Unary",
    operator,
    right,
    token,
  };
}

type BinaryNode = {
  type: "Binary";
  left: ExpressionNode;
  operator: Operator;
  right: ExpressionNode;
  token: Token;
};

export function createBinaryNode(
  left: ExpressionNode,
  operator: Operator,
  right: ExpressionNode,
  token: Token
): BinaryNode {
  return {
    type: "Binary",
    left,
    operator,
    right,
    token,
  };
}

export type ArrayNode = {
  type: "Array";
  elements: ASTNode[];
  startToken: Token;
  endToken: Token;
};

export function createArrayNode(
  elements: ASTNode[],
  startToken: Token,
  endToken: Token
): ArrayNode {
  return {
    type: "Array",
    elements,
    startToken,
    endToken,
  };
}

export type ObjectProperty = {
  type: "ObjectProperty";
  key: ExpressionNode;
  value: ExpressionNode;
};

export function createObjectProperty(
  key: ExpressionNode,
  value: ExpressionNode
): ObjectProperty {
  return {
    type: "ObjectProperty",
    key,
    value,
  };
}

export type ObjectNode = {
  type: "Object";
  properties: ObjectProperty[];
  startToken: Token;
  endToken: Token;
};

export function createObjectNode(
  properties: ObjectProperty[],
  startToken: Token,
  endToken: Token
): ObjectNode {
  return {
    type: "Object",
    properties,
    startToken,
    endToken,
  };
}

export type ExpressionNode =
  | LiteralNode
  | UnaryNode
  | BinaryNode
  | ArrayNode
  | ObjectNode;

export type ASTNode = ExpressionNode;
