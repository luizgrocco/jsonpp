#!/usr/bin/env -S deno run

import { parseArgs } from "@std/cli/parse-args";

const args = parseArgs(Deno.args, {
  alias: { h: "help", n: "name" },
  boolean: ["help", "verbose"],
  string: ["name", "output"],
  default: { verbose: false, output: "out.txt" },
  negatable: ["verbose"],
});

if (args.help) {
  console.log("Usage: mycli --name <name> [--verbose] [--output <path>]");
  Deno.exit();
}

console.log("Parsed flags:", args);

if (import.meta.main) {
  console.log("ran");
}
