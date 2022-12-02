import { Generator } from "./generator/generator";
import { compareCommit } from "./git/log";
import { Config } from "./config/config";
import { getInput, info, setFailed, setOutput } from "@actions/core";

async function run() {
  try {
    const config = new Config();
    await config.load();
    const from = getInput("from", { required: true });
    const to = getInput("to", { required: true });
    const log = await compareCommit(from, to);
    const generator = new Generator(log, {
      template: config.template ?? "",
      prTypes: config.prTypes ?? [],
    });
    const result = generator.generate();
    info(`Generated release note:\n${result}`);
    setOutput("out", result);
  } catch (e) {
    setFailed(`Action failed with error: ${e}`);
  }
}

run();
