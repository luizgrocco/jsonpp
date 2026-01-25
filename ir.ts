export type TypedNode =
  | TypedNumberNode
  | TypedStringNode
  | TypedBooleanNode
  | TypedNullNode
  | TypedArrayNode
  | TypedObjectNode;

// --- Number Nodes ---
export type TypedNumberNode =
  | { kind: "NumberLiteral"; value: number }
  | { kind: "NumberUnaryPlus"; operand: TypedNumberNode }
  | { kind: "NumberUnaryMinus"; operand: TypedNumberNode }
  | { kind: "NumberAdd"; left: TypedNumberNode; right: TypedNumberNode }
  | { kind: "NumberSubtract"; left: TypedNumberNode; right: TypedNumberNode }
  | { kind: "NumberMultiply"; left: TypedNumberNode; right: TypedNumberNode }
  | { kind: "NumberDivide"; left: TypedNumberNode; right: TypedNumberNode }
  | { kind: "NumberExponent"; left: TypedNumberNode; right: TypedNumberNode };

// --- String Nodes ---
export type TypedStringNode =
  | { kind: "StringLiteral"; value: string }
  | { kind: "StringConcat"; left: TypedStringNode; right: TypedStringNode };

// --- Boolean Nodes ---
export type TypedBooleanNode =
  | { kind: "BooleanLiteral"; value: boolean }
  | { kind: "BooleanNot"; operand: TypedBooleanNode };

// --- Null Nodes ---
export type TypedNullNode = { kind: "NullLiteral"; value: null };

// --- Array Nodes ---
export type TypedArrayNode =
  | { kind: "ArrayLiteral"; elements: TypedNode[] }
  | { kind: "ArrayConcat"; left: TypedArrayNode; right: TypedArrayNode };

// --- Object Nodes ---
export type TypedObjectProperty = {
  kind: "ObjectProperty";
  key: TypedStringNode; // Keys in JSON are always strings
  value: TypedNode;
};

export type TypedObjectNode = {
  kind: "ObjectLiteral";
  properties: TypedObjectProperty[];
};
