import { readFileSync, writeFileSync } from "fs";
import peggy from "peggy";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tspegjs from "ts-pegjs";

const parserFiles: {
  sourcePath: string;
  options?: {
    tspegjs?: any;
    returnTypes?: any;
  };
  outputPath: string;
}[] = [
  {
    sourcePath: "src/generator/parser/expression-parser.pegjs",
    options: {
      tspegjs: {
        customHeader: `import { ASTNode, ASTNodeType, BooleanNode, MacroNode, StringNode, VariableNode } from "./ast";`,
      },
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
    outputPath: "src/generator/parser/expression-parser.ts",
  },
  {
    sourcePath: "src/generator/parser/template-parser.pegjs",
    outputPath: "src/generator/parser/template-parser.ts",
  },
];

for (const parserFile of parserFiles) {
  const parser = peggy.generate(readFileSync(parserFile.sourcePath, "utf-8"), {
    output: "source",
    format: "commonjs",
    plugins: [tspegjs],
    ...parserFile.options,
  });
  writeFileSync(parserFile.outputPath, parser, {
    encoding: "utf-8",
  });
}
