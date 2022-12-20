import { describe, test, expect } from "@jest/globals";
import { parse } from "../../../src/generator/parser/expression-parser";
import { ASTNodeType } from "../../../src/generator/parser/ast";

describe("Parser test", () => {
  describe("String literal", () => {
    const expectValue = {
      type: ASTNodeType.String,
      value: "test",
    };
    test("double quote", () => {
      expect(parse('"test"')).toEqual(expectValue);
    });
    test("single quote", () => {
      expect(parse("'test'")).toEqual(expectValue);
    });
    test("with space", () => {
      expect(parse(" 'test' ")).toEqual(expectValue);
      expect(parse(' "test" ')).toEqual(expectValue);
    });
  });
  describe("Boolea literal", () => {
    const trueNode = {
      type: ASTNodeType.Boolean,
      value: true,
    };
    const falseNode = {
      type: ASTNodeType.Boolean,
      value: false,
    };
    test("true", () => {
      expect(parse("true")).toEqual(trueNode);
    });
    test("false", () => {
      expect(parse("false")).toEqual(falseNode);
    });
    test("with space", () => {
      expect(parse(" true ")).toEqual(trueNode);
      expect(parse(" false ")).toEqual(falseNode);
    });
  });
  describe("Variable", () => {
    const expectValue = {
      type: ASTNodeType.Variable,
      name: "test",
    };
    test("simple variable", () => {
      expect(parse("test")).toEqual(expectValue);
    });
    test("with space", () => {
      expect(parse(" test ")).toEqual(expectValue);
    });
  });
  describe("Macro", () => {
    const testMacro = {
      type: ASTNodeType.Macro,
      funName: "test",
      args: [],
    };
    const mutipleArgsMacro = {
      type: ASTNodeType.Macro,
      funName: "generateIfNotEmpty",
      args: [
        {
          type: ASTNodeType.String,
          value: "",
        },
        {
          type: ASTNodeType.String,
          value: "test",
        },
      ],
    };
    test("no arg", () => {
      expect(parse("test()")).toEqual(testMacro);
    });
    test("Single arg", () => {
      expect(parse("toSentence('test')")).toEqual({
        type: ASTNodeType.Macro,
        funName: "toSentence",
        args: [
          {
            type: ASTNodeType.String,
            value: "test",
          },
        ],
      });
    });
    test("Multiple args", () => {
      expect(parse("generateIfNotEmpty('', 'test')")).toEqual(mutipleArgsMacro);
    });
    test("Macro call as a args", () => {
      expect(parse("generateIfNotEmpty('', toSentence('test'))")).toEqual({
        type: ASTNodeType.Macro,
        funName: "generateIfNotEmpty",
        args: [
          {
            type: ASTNodeType.String,
            value: "",
          },
          {
            type: ASTNodeType.Macro,
            funName: "toSentence",
            args: [
              {
                type: ASTNodeType.String,
                value: "test",
              },
            ],
          },
        ],
      });
    });
    test("with space", () => {
      expect(parse(" test() ")).toEqual(testMacro);
    });
    test("Multiple args with space", () => {
      expect(parse("generateIfNotEmpty( '' , 'test' )")).toEqual(
        mutipleArgsMacro,
      );
    });
  });
});
