#!/usr/bin/env -S deno run

import { parseArgs } from "@std/cli/parse-args";
import { createLexer, tokenize } from "./lexer.ts";
import { createParser, parse } from "./parser.ts";
import { createSemanticAnalyzer, analyze } from "./semantic_analyzer.ts";
import { createCompiler, compile } from "./compiler.ts";

const args = parseArgs(Deno.args, {
  alias: { h: "help", f: "file" },
  boolean: ["help", "verbose"],
  string: ["file", "output"],
  default: { verbose: false, output: "out.json" },
  negatable: ["verbose"],
});

if (args.help || !args.file) {
  console.log("Usage: mycli --file <path> [--verbose] [--output <path>]");
  Deno.exit();
}

async function main() {
  try {
    const source = await Deno.readTextFile(args.file as string);
    const lexer = createLexer(source);
    const tokens = tokenize(lexer);
    const parser = createParser(tokens);
    const ast = parse(parser);
    const semanticAnalyzer = createSemanticAnalyzer();
    analyze(semanticAnalyzer, ast);
    const compiler = createCompiler(ast);
    const compiled = compile(compiler);
    await Deno.writeTextFile(args.output as string, JSON.stringify(compiled));
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      Deno.exit(1);
    }
  }
}

if (import.meta.main) {
  main();
}
