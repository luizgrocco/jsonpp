import { Token } from "./token.ts";

type JsonPPValue = string | number | boolean | null;

export const UnaryOperators = {
  PLUS: "U_PLUS",
  MINUS: "U_MINUS",
  BANG: "BANG"
} as const;

type UnaryOperator = typeof UnaryOperators[keyof typeof UnaryOperators];

export const BinaryOperators = {
  PLUS: "PLUS",
  MINUS: "MINUS",
  TIMES: "TIMES",
  DIVIDES: "DIVIDES",
  EXPONENT: "EXPONENT",
} as const;

type BinaryOperator = typeof BinaryOperators[keyof typeof BinaryOperators];

export type Operator = UnaryOperator | BinaryOperator;

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
  operator: UnaryOperator;
  right: ExpressionNode;
  token: Token;
};

export function createUnaryNode(
  operator: UnaryOperator,
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
  operator: BinaryOperator;
  right: ExpressionNode;
  token: Token;
};

export function createBinaryNode(
  left: ExpressionNode,
  operator: BinaryOperator,
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

type ObjectProperty = {
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
