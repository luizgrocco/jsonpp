import {
  ASTNode,
  BinaryNode,
  BinaryOperators,
  UnaryNode,
  UnaryOperators,
} from "./ast.ts";
import {
  TypedNode,
  TypedNumberNode,
  TypedStringNode,
  TypedBooleanNode,
  TypedArrayNode,
  TypedObjectNode,
  TypedNullNode,
  TypedObjectProperty,
} from "./ir.ts";

export function analyze(node: ASTNode): TypedNode {
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "number") {
        return { kind: "NumberLiteral", value: node.value };
      } else if (typeof node.value === "string") {
        return { kind: "StringLiteral", value: node.value };
      } else if (typeof node.value === "boolean") {
        return { kind: "BooleanLiteral", value: node.value };
      } else {
        return { kind: "NullLiteral", value: null };
      }
    case "Unary":
      return analyzeUnary(node);
    case "Binary":
      return analyzeBinary(node);
    case "Array": {
      const elements = node.elements.map(analyze);
      return { kind: "ArrayLiteral", elements };
    }
    case "Object": {
      const properties: TypedObjectProperty[] = node.properties.map((prop) => {
        const key = analyze(prop.key);
        if (!isStringNode(key)) {
          throw new Error(
            `Object keys must evaluate to strings. Got ${getParamType(key)}`
          );
        }
        const value = analyze(prop.value);
        return { kind: "ObjectProperty", key, value };
      });
      return { kind: "ObjectLiteral", properties };
    }
    default:
      throw new Error("Unknown node type");
  }
}

function analyzeUnary(node: UnaryNode): TypedNode {
  const right = analyze(node.right);
  switch (node.operator) {
    case UnaryOperators.PLUS:
      if (!isNumberNode(right)) {
        throw new Error(
          `Operator '+' requires a number. Got ${getParamType(right)}`
        );
      }
      return { kind: "NumberUnaryPlus", operand: right };
    case UnaryOperators.MINUS:
      if (!isNumberNode(right)) {
        throw new Error(
          `Operator '-' requires a number. Got ${getParamType(right)}`
        );
      }
      return { kind: "NumberUnaryMinus", operand: right };
    case UnaryOperators.BANG:
      if (!isBooleanNode(right)) {
        throw new Error(
          `Operator '!' requires a boolean. Got ${getParamType(right)}`
        );
      }
      return { kind: "BooleanNot", operand: right };
  }
}

function analyzeBinary(node: BinaryNode): TypedNode {
  const left = analyze(node.left);
  const right = analyze(node.right);

  switch (node.operator) {
    case BinaryOperators.PLUS:
      if (isNumberNode(left) && isNumberNode(right)) {
        return { kind: "NumberAdd", left, right };
      } else if (isStringNode(left) && isStringNode(right)) {
        return { kind: "StringConcat", left, right };
      } else if (isArrayNode(left) && isArrayNode(right)) {
        return { kind: "ArrayConcat", left, right };
      }
      throw new Error(
        `Operator '+' cannot apply to ${getParamType(left)} and ${getParamType(
          right
        )}`
      );

    case BinaryOperators.MINUS:
      checkNumberOperands(node.operator, left, right);
      return {
        kind: "NumberSubtract",
        left: left as TypedNumberNode,
        right: right as TypedNumberNode,
      };
    case BinaryOperators.TIMES:
      checkNumberOperands(node.operator, left, right);
      return {
        kind: "NumberMultiply",
        left: left as TypedNumberNode,
        right: right as TypedNumberNode,
      };
    case BinaryOperators.DIVIDES:
      checkNumberOperands(node.operator, left, right);
      return {
        kind: "NumberDivide",
        left: left as TypedNumberNode,
        right: right as TypedNumberNode,
      };
    case BinaryOperators.EXPONENT:
      checkNumberOperands(node.operator, left, right);
      return {
        kind: "NumberExponent",
        left: left as TypedNumberNode,
        right: right as TypedNumberNode,
      };
  }
}

function checkNumberOperands(
  op: string,
  left: TypedNode,
  right: TypedNode
): asserts left is TypedNumberNode {
  if (!isNumberNode(left) || !isNumberNode(right)) {
    throw new Error(
      `Operator '${op}' requires numbers. Got ${getParamType(
        left
      )} and ${getParamType(right)}`
    );
  }
}

// --- Type Guards ---
export function isNumberNode(node: TypedNode): node is TypedNumberNode {
  return (
    node.kind === "NumberLiteral" ||
    node.kind === "NumberUnaryPlus" ||
    node.kind === "NumberUnaryMinus" ||
    node.kind === "NumberAdd" ||
    node.kind === "NumberSubtract" ||
    node.kind === "NumberMultiply" ||
    node.kind === "NumberDivide" ||
    node.kind === "NumberExponent"
  );
}

export function isStringNode(node: TypedNode): node is TypedStringNode {
  return node.kind === "StringLiteral" || node.kind === "StringConcat";
}

export function isBooleanNode(node: TypedNode): node is TypedBooleanNode {
  return node.kind === "BooleanLiteral" || node.kind === "BooleanNot";
}

export function isArrayNode(node: TypedNode): node is TypedArrayNode {
  return node.kind === "ArrayLiteral" || node.kind === "ArrayConcat";
}

export function isNullNode(node: TypedNode): node is TypedNullNode {
  return node.kind === "NullLiteral";
}

export function isObjectNode(node: TypedNode): node is TypedObjectNode {
  return node.kind === "ObjectLiteral";
}

function getParamType(node: TypedNode): string {
  if (isNumberNode(node)) return "Number";
  if (isStringNode(node)) return "String";
  if (isBooleanNode(node)) return "Boolean";
  if (isArrayNode(node)) return "Array";
  if (isObjectNode(node)) return "Object";
  if (isNullNode(node)) return "Null";
  return "Unknown";
}
