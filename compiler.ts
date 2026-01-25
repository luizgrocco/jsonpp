import { RuntimeValue } from "./evaluator.ts";

export function compile(value: RuntimeValue): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    const elements = value.map((element) => compile(element)).join(",");
    return `[${elements}]`;
  }
  if (typeof value === "object") {
    const properties = Object.entries(value)
      .map(([key, val]) => `"${key}":${compile(val)}`)
      .join(",");
    return `{${properties}}`;
  }

  throw new Error(`Unexpected value type: ${typeof value}`);
}

