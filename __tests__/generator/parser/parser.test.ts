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
  });
  describe("Boolea literal", () => {
    test("true", () => {
      expect(parse("true")).toEqual({
        type: ASTNodeType.Boolean,
        value: true,
      });
    });
    test("false", () => {
      expect(parse("false")).toEqual({
        type: ASTNodeType.Boolean,
        value: false,
      });
    });
  });
  describe("Variable", () => {
    test("simple variable", () => {
      expect(parse("test")).toEqual({
        type: ASTNodeType.Variable,
        name: "test",
      });
    });
  });
  describe("Macro", () => {
    test("no arg", () => {
      expect(parse("test()")).toEqual({
        type: ASTNodeType.Macro,
        funName: "test",
        args: [],
      });
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
      expect(parse("generateIfNotEmpty('', 'test')")).toEqual({
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
      });
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
  });
});
