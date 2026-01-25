import {
  TypedNode,
  TypedNumberNode,
  TypedStringNode,
  TypedBooleanNode,
  TypedArrayNode,
  TypedObjectNode,
} from "./ir.ts";
import {
  isArrayNode,
  isBooleanNode,
  isNullNode,
  isNumberNode,
  isObjectNode,
  isStringNode,
} from "./semantic_analyzer.ts";

export type RuntimeValue =
  | number
  | string
  | boolean
  | null
  | RuntimeValue[]
  | { [key: string]: RuntimeValue };

export function evaluate(node: TypedNode): RuntimeValue {
  // We can use a switch on discriminated unions or helper functions
  // Since TypedNode is a union of disjoint types (mostly), we can dispatch based on kind prefixes or checking specific kinds.
  // However, because we have many kinds, it's better to delegate.

  if (isNumberNode(node)) return evaluateNumber(node);
  if (isStringNode(node)) return evaluateString(node);
  if (isBooleanNode(node)) return evaluateBoolean(node);
  if (isNullNode(node)) return null;
  if (isArrayNode(node)) return evaluateArray(node);
  if (isObjectNode(node)) return evaluateObject(node);

  throw new Error(`Unknown node: ${node}`);
}

function evaluateNumber(node: TypedNumberNode): number {
  switch (node.kind) {
    case "NumberLiteral":
      return node.value;
    case "NumberUnaryPlus":
      return +evaluateNumber(node.operand);
    case "NumberUnaryMinus":
      return -evaluateNumber(node.operand);
    case "NumberAdd":
      return evaluateNumber(node.left) + evaluateNumber(node.right);
    case "NumberSubtract":
      return evaluateNumber(node.left) - evaluateNumber(node.right);
    case "NumberMultiply":
      return evaluateNumber(node.left) * evaluateNumber(node.right);
    case "NumberDivide":
      return evaluateNumber(node.left) / evaluateNumber(node.right);
    case "NumberExponent":
      return evaluateNumber(node.left) ** evaluateNumber(node.right);
  }
}

function evaluateString(node: TypedStringNode): string {
  switch (node.kind) {
    case "StringLiteral":
      return node.value;
    case "StringConcat":
      return evaluateString(node.left) + evaluateString(node.right);
  }
}

function evaluateBoolean(node: TypedBooleanNode): boolean {
  switch (node.kind) {
    case "BooleanLiteral":
      return node.value;
    case "BooleanNot":
      return !evaluateBoolean(node.operand);
  }
}

function evaluateArray(node: TypedArrayNode): RuntimeValue[] {
  switch (node.kind) {
    case "ArrayLiteral":
      return node.elements.map(evaluate);
    case "ArrayConcat":
      return [...evaluateArray(node.left), ...evaluateArray(node.right)];
  }
}

function evaluateObject(node: TypedObjectNode): {
  [key: string]: RuntimeValue;
} {
  const result: { [key: string]: RuntimeValue } = {};
  for (const prop of node.properties) {
    const key = evaluateString(prop.key);
    const value = evaluate(prop.value);
    result[key] = value;
  }
  return result;
}
