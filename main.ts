#!/usr/bin/env -S deno run

import { parseArgs } from "@std/cli/parse-args";
import { createLexer, tokenize } from "./lexer.ts";
import { createParser, parse } from "./parser.ts";
import { analyze } from "./semantic_analyzer.ts";
import { evaluate } from "./evaluator.ts";
import { compile } from "./compiler.ts";

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
    const source = Deno.readTextFileSync(args.file as string);
    const lexer = createLexer(source);
    const tokens = tokenize(lexer);
    const parser = createParser(tokens);
    const ast = parse(parser);
    const ir = analyze(ast);
    const result = evaluate(ir);
    const compiled = compile(result);
    await Deno.writeTextFile(args.output as string, compiled);
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
