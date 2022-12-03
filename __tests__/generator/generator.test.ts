import { describe, test, expect } from "@jest/globals";
import { Generator } from "../../src/generator/generator";
import { commits } from "../data/commits";

describe("Generator test", () => {
  test("Generate a release note", () => {
    const generator = new Generator(commits, {
      prTypes: [
        { identifier: "feat", title: "🚀 Enhancements" },
        { identifier: "fix", title: "🩹 Fixes" },
        { identifier: "docs", title: "📖 Documentation" },
        { identifier: "chore", title: "🏡 Chore" },
        { identifier: "refactor", title: "💅 Refactors" },
        { identifier: "test", title: "✅ Tests" },
      ],
      template: `## 📝 Changelog
%% changes %%

### {{ title }}

%% commits %%
- {{ prSubtype }}{{ generateIfNotEmpty(prSubtype, ": ") }}{{ message }} (#{{ prNumber }})
%% commits %%
%% changes %%
`,
    });
    expect(generator.generate()).toBe(`## 📝 Changelog

### 🚀 Enhancements

- frontend: list UI improvement (#212)
- search engine friendly CoursesSearch (#199)

### 🩹 Fixes

- frontend: invalid route in ReviewFrame (#210)
- frontend: page number isn't reset when changing filter (#203)
- feedback page params validation (#201)
- page value is inconsistent (#197)
- course feedback test failed sometime (#195)
- show wrong page when user view feedback and back (#192)
- wrong dev proxy setting (#191)

### 🏡 Chore

- remove unnecessary files (#193)
- deps: update pnpm to v7.17.0 (#190)

### 💅 Refactors

- frontend: direct call api endpoint instead of calling wrapper (#207)
- frontend: paginator state management (#205)
`);
  });
});
