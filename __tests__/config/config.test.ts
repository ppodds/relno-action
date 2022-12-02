import { describe, test, expect } from "@jest/globals";
import { Config } from "../../src/config/config";

describe("config test", () => {
  test("load config", async () => {
    const config = new Config();
    await config.load("__tests__/data/test-config.json");
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
});
