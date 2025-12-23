import { ASTNode, BinaryOperators, UnaryOperators } from "./ast.ts";

type JSON = string;

type Compiler = {
  ast: ASTNode;
};

export function createCompiler(ast: ASTNode): Compiler {
  return {
    ast,
  };
}

function compile(compiler: Compiler): JSON {
  const root = compiler.ast;

  return compileAST(root);
}

function compileAST(node: ASTNode): JSON {
  switch (node.type) {
    case "Literal": {
      switch (typeof node.value) {
        case "string":
          return `"${node.value}"`;
        case "number":
          return `${node.value}`;
        case "object":
          return `${node.value}`;
        case "boolean":
          return `${node.value}`;
        default:
          throw new Error(
            `Expected valid value at line ${node.token.line} column ${node.token.column}, got ${node.token.lexeme}`
          );
      }
    }
    case "Unary": {
      const token = node.token;
      const right = compileAST(node.right);
      switch (node.operator) {
        case UnaryOperators.PLUS:
          return right;
        case UnaryOperators.MINUS:
          return `-${right}`;
        case UnaryOperators.BANG:
          return `${!compileAST(node.right)}`;
        default:
          throw new Error(
            `Expected unary operator at line ${token.line} column ${token.column}, got ${token.lexeme}`
          );
      }
    }
    case "Binary": {
      const token = node.token;
      switch (node.operator) {
        case BinaryOperators.PLUS:
          return `${compileAST(node.left) + compileAST(node.right)}`;
        case BinaryOperators.MINUS:
          return `${compileAST(node.left) - compileAST(node.right)}`;
        case "TIMES":
          return `${compileAST(node.left) * compileAST(node.right)}`;
        case "DIVIDES":
          return `${compileAST(node.left) / compileAST(node.right)}`;
        case "EXPONENT":
          return `${Math.pow(compileAST(node.left), compileAST(node.right))}`;
        default:
          throw new Error(
            `Expected binary operator at line ${token.line} column ${token.column}, got ${token.lexeme}`
          );
      }
    }
    case "Array":
    case "Object":
  }
}
