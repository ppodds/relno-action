import { readFileSync, writeFileSync } from "fs";
import peggy from "peggy";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tspegjs from "ts-pegjs";

const parser = peggy.generate(
  readFileSync("src/generator/parser/grammar.pegjs", "utf-8"),
  {
    output: "source",
    format: "commonjs",
    plugins: [tspegjs],
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tspegjs: {
      customHeader: `import { ASTNode, ASTNodeType, BooleanNode, MacroNode, StringNode, VariableNode } from "./ast";`,
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    returnTypes: {
      identifier: "string",
      bool: "BooleanNode",
      doubleQuotedString: "StringNode",
      singleQuotedString: "StringNode",
      string: "StringNode",
      macroCall: "ASTNode[]",
      macro: "MacroNode",
      expression: "ASTNode",
    },
  },
);

writeFileSync("src/generator/parser/grammar.ts", parser, {
  encoding: "utf-8",
});
