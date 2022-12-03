import { Commit } from "../git/log";
import { ExpressionEvaluator } from "./expression-evaluator";
import { PRType } from "./pr-type";

export interface GeneratorOptions {
  prTypes: PRType[];
  template: string;
}

export class Generator {
  private readonly _log: readonly Commit[];
  private readonly _options: GeneratorOptions;
  constructor(log: readonly Commit[], options: GeneratorOptions) {
    this._log = log;
    this._options = options;
  }

  /**
   * Generate the release note from commits and options
   * @returns The release notes
   */
  public generate(): string {
    return this.parseGlobalSection();
  }

  private parseGlobalSection(): string {
    const section = this.getSection("changes");
    return this.replaceSection(
      this._options.template,
      "changes",
      section,
      this.parseChangesSection(section),
    );
  }

  private parseChangesSection(changesTemplate: string): string {
    const section = this.getSection("commits");
    let result = "";
    for (const prType of this._options.prTypes) {
      const commits = this._log.filter((commit) => {
        return (
          commit.parents.split(" ").length > 1 &&
          commit.message.match(new RegExp(`${prType.identifier}((.*))?: `))
        );
      });
      if (commits.length === 0) continue;
      result += this.parseTemplate(
        this.replaceSection(
          changesTemplate,
          "commits",
          section,
          this.parseCommitsSection(section, commits),
        ),
        { ...prType },
      );
    }
    return result;
  }

  private parseCommitsSection(
    commitsTemplate: string,
    commits: Commit[],
  ): string {
    let result = "";
    for (const commit of commits) {
      const regex = /([^()\n]+)(?:\((.*)\))?: (.+) \(#([1-9][0-9]*)\)/;
      const matchResult = commit.message.match(regex);
      if (!matchResult) continue;
      const prType = matchResult[1];
      const prSubtype = matchResult[2] ?? "";
      const message = matchResult[3];
      const prNumber = matchResult[4];
      result += this.parseTemplate(commitsTemplate, {
        ...commit,
        prType,
        prSubtype,
        message,
        prNumber,
      });
    }
    return result;
  }

  public getSection(section: string) {
    const regex = new RegExp(
      `%% *${section} *%% *\n((.|\r|\n)*)%% *${section} *%% *`,
    );
    const result = this._options.template.match(regex);
    if (!result) return "";
    return result[1];
  }

  private replaceSection(
    template: string,
    sectionName: string,
    sectionContent: string,
    parsedSection: string,
  ) {
    const newTemplate = template.replace(
      new RegExp(`%% *${sectionName} *%%\n`, "g"),
      "",
    );
    return newTemplate.replace(sectionContent, parsedSection);
  }

  private parseTemplate(
    template: string,
    variable: {
      [key: string]: string | undefined;
    },
  ): string {
    const regex = /{{([^\n}}]*)}}/;
    let matchResult = template.match(regex);
    let result = template;
    while (matchResult) {
      const evaluator = new ExpressionEvaluator(variable);
      const parsedVariable = evaluator.evaluate(matchResult[1].trim());
      result = result.replace(regex, parsedVariable);
      matchResult = result.match(regex);
    }
    return result;
  }
}
