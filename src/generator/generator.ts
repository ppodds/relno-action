import { Commit } from "../git/log";
import { ExpressionEvaluator, Variable } from "./expression-evaluator";
import { PRType } from "./pr-type";

export interface ReleaseMetadata {
  authorLogin: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  discussionUrl: string;
  htmlUrl: string;
  id: string;
  name: string;
  publishedAt: string;
  tagName: string;
  fromVersion: string;
  tarballUrl: string;
  targetCommitish: string;
  zipballUrl: string;
  compareUrl: string;
}

export interface GeneratorOptions {
  prTypes: PRType[];
  template: string;
  metadata: ReleaseMetadata;
}

export class Generator {
  private readonly _log: readonly Commit[];
  private readonly _options: GeneratorOptions;
  private readonly _data: { prType: PRType; commits: Commit[] }[];
  constructor(log: readonly Commit[], options: GeneratorOptions) {
    this._log = log;
    this._options = options;
    this._data = [];
  }

  /**
   * Generate the release note from commits and options
   * @returns The release notes
   */
  public generate(): string {
    // clear data if already generated
    if (this._data.length !== 0) this._data.splice(0, this._data.length);
    // gererate necessary information
    for (const prType of this._options.prTypes) {
      const filter =
        prType.filter ??
        ((type: PRType, commit: Commit) =>
          commit.message.match(
            new RegExp(
              `${type.identifier}(?:\\(.*\\))?!?: .+ \\(#[1-9][0-9]*\\)`,
            ),
          ) !== null);
      const commits = this._log.filter(
        (commit) =>
          commit.parents.split(" ").length > 1 && filter(prType, commit),
      );
      this._data.push({ prType, commits });
    }
    return this.parseGlobalSection();
  }

  private parseGlobalSection(): string {
    const section = this.getSection("changes");
    return this.parseTemplate(
      this.replaceSection(
        this._options.template,
        "changes",
        section,
        this.parseChangesSection(section),
      ),
      {
        ...this._options.metadata,
      },
    );
  }

  private parseChangesSection(changesTemplate: string): string {
    const section = this.getSection("commits");
    let result = "";
    for (const entry of this._data) {
      if (entry.commits.length === 0) continue;
      result += this.parseTemplate(
        this.replaceSection(
          changesTemplate,
          "commits",
          section,
          this.parseCommitsSection(section, entry.commits),
        ),
        { identifier: entry.prType.identifier, title: entry.prType.title },
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
      const regex = /([^()\n!]+)(?:\((.*)\))?(!)?: (.+) \(#([1-9][0-9]*)\)/;
      const matchResult = commit.message.match(regex);
      if (!matchResult) continue;
      const prType = matchResult[1];
      const prSubtype = matchResult[2] ?? "";
      const prBreaking = matchResult[3] === "!";
      const message = matchResult[4];
      const prNumber = matchResult[5];
      result += this.parseTemplate(commitsTemplate, {
        ...commit,
        prType,
        prSubtype,
        prBreaking,
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

  private parseTemplate(template: string, variable: Variable): string {
    const regex = /{{([^\n}}]*)}}/;
    let matchResult = template.match(regex);
    let result = template;
    while (matchResult) {
      const evaluator = new ExpressionEvaluator(variable);
      const parsedVariable = evaluator.evaluate(matchResult[1].trim());
      // convert boolean to string
      if (typeof parsedVariable === "boolean")
        result = result.replace(
          matchResult[0],
          parsedVariable ? "true" : "false",
        );
      else result = result.replace(regex, parsedVariable);
      matchResult = result.match(regex);
    }
    return result;
  }
}
