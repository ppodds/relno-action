import { error } from "@actions/core";
import { readFile } from "fs/promises";
import { PRType } from "../generator/pr-type";

interface ConfigFile {
  template: string;
}

export class Config {
  private _templatePath: string | undefined;
  private _template: string | undefined;
  private _prTypes: PRType[] | undefined;
  public async load() {
    try {
      const config: ConfigFile = JSON.parse(
        await readFile("release-note.json", {
          encoding: "utf-8",
        }),
      );
      this._templatePath = config.template;
      this._template = await readFile(this._templatePath, {
        encoding: "utf-8",
      });
    } catch (e) {
      error("Failed to load the config file or the template file");
    }
  }

  public get template(): string | undefined {
    return this._template;
  }

  public get prTypes(): PRType[] | undefined {
    return this._prTypes;
  }
}
