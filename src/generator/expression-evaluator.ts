import { macros } from "./macros";

export interface Variable {
  [key: string]: string | boolean | undefined;
}

export class ExpressionEvaluator {
  private readonly _variable: Variable;
  constructor(variable: Variable) {
    this._variable = variable;
  }

  /**
   * Evaluate an expression, it can be a string literal, a macro or a variable
   * @param expression The expression to evaluate
   * @returns evaluated expression
   */
  public evaluate(expression: string): string | boolean {
    const macroRegex = /([A-Za-z0-9]+)\(([^\n]*)\)/;
    const matchResult = expression.match(macroRegex);
    // is a variable or a string literal
    if (!matchResult) {
      if (expression.startsWith('"') || expression.startsWith("'"))
        return this.evaluateStringLiteral(expression);
      const parsedVariable = this._variable[expression];
      if (parsedVariable === undefined)
        throw new Error(`Unsupport variable: ${expression}`);
      if (
        typeof parsedVariable !== "string" &&
        typeof parsedVariable !== "boolean"
      )
        throw new Error(
          `Parsed variable is not a string or boolean, it should never happen: parsed variable is a ${typeof parsedVariable}`,
        );
      return parsedVariable;
    }
    // evaluate macro
    return this.evaluateMacro(matchResult[1], matchResult[2]);
  }

  private evaluateStringLiteral(literal: string): string {
    const singleQuoteRegex = /'([^'\n]*)'/;
    const doubleQuoteRegex = /"([^"\n]*)"/;
    const singleResult = literal.match(singleQuoteRegex);
    const doubleResult = literal.match(doubleQuoteRegex);
    if (singleResult && singleResult[1].length === literal.length - 2)
      return singleResult[1];
    else if (doubleResult && doubleResult[1].length === literal.length - 2)
      return doubleResult[1];
    else throw new Error(`Invalid string literal: ${literal}`);
  }

  /**
   * Evaluate a macro recursively
   * @param macroName The name of the macro
   * @param macroArgs macro arguments (not parsed)
   */
  private evaluateMacro(macroName: string, macroArgs: string): string {
    const macro = (
      macros as {
        [x: string]: ((...args: (string | boolean)[]) => string) | undefined;
      }
    )[macroName];
    if (macro === undefined) throw new Error(`Unsupport macro: ${macroName}`);
    const parsedArgs = this.parseArgs(macroArgs);
    // check function signature
    if (macro.length !== parsedArgs.length)
      throw new Error("Wrong number of arguments");
    const evaluatedArgs = parsedArgs.map((arg) => this.evaluate(arg));
    return macro(...evaluatedArgs);
  }

  /**
   * Generate an array of arguments from arguments string
   * @param args macro arguments (not parsed)
   * @returns parsed arguments
   */
  private parseArgs(args: string): string[] {
    const result: string[] = [];
    let currentArg = "";
    let nestedCount = 0;
    for (let i = 0; i < args.length; i++) {
      const c = args[i];
      if (c === "," && nestedCount === 0) {
        result.push(currentArg);
        currentArg = "";
      } else {
        currentArg += c;
        if (c === "(") nestedCount++;
        else if (c === ")") nestedCount--;
      }
    }
    result.push(currentArg);
    return result.map((s) => s.trim());
  }
}
