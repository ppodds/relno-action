import { describe, test, expect } from "@jest/globals";
import { Config } from "../../src/config/config";

describe("config test", () => {
  test("load config", async () => {
    const config = new Config();
    await config.load("__tests__/data/test-config.ts");
    expect(config.template).toEqual(`## Test

test
`);
    expect(config.prTypes).toEqual([
      { identifier: "feat", title: "🚀 Enhancements" },
      { identifier: "fix", title: "🩹 Fixes" },
      { identifier: "docs", title: "📖 Documentation" },
      { identifier: "chore", title: "🏡 Chore" },
      { identifier: "refactor", title: "💅 Refactors" },
      { identifier: "test", title: "✅ Tests" },
    ]);
  });
  test("load config with default value", async () => {
    const config = new Config();
    expect(async () => await config.load()).not.toThrowError();
  });
  test("load config with a not exist path", async () => {
    const config = new Config();
    expect(async () => await config.load("9487")).rejects.toThrowError();
  });
});
