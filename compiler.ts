import { ASTNode } from "./ast.ts";

type JSON = string;

type Compiler = {
  ast: ASTNode;
};

export function createCompiler(ast: ASTNode): Compiler {
  return {
    ast,
  };
}

export function compile(compiler: Compiler): JSON {
  const root = compiler.ast;

  return compileAST(root);
}

function compileAST(node: ASTNode): JSON {
  switch (node.type) {
    case "Literal": {
      if (node.value === null) {
        return "null";
      }
      if (typeof node.value === "string") {
        return `"${node.value}"`;
      }
      return node.value.toString();
    }
    case "Array": {
      const elements = node.elements.map(compileAST).join(",");
      return `[${elements}]`;
    }
    case "Object": {
      const properties = node.properties
        .map(
          (prop) =>
            `${compileAST(prop.key)}:${compileAST(prop.value)}`
        )
        .join(",");
      return `{${properties}}`;
    }
    default:
      throw new Error(`Unexpected node type`);
  }
}

