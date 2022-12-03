import { Generator } from "./generator/generator";
import { compareCommit } from "./git/log";
import { Config } from "./config/config";
import { debug, info, setFailed, setOutput } from "@actions/core";
import { context } from "@actions/github";
import { getEndVersion, getStartVersion } from "./git/version";

async function run() {
  try {
    const config = new Config();
    await config.load();
    info(`Triggered by: ${context.eventName}`);
    const to = getEndVersion();
    const from = await getStartVersion(to);
    info(`Comparing from ${from} to ${to}`);
    const log = await compareCommit(from, to);
    debug(`Found commits: ${log}`);
    const generator = new Generator(log, {
      template: config.template ?? "",
      prTypes: config.prTypes ?? [],
    });
    info("Generating changelog");
    const result = generator.generate();
    info(`Generated release note:\n${result}`);
    setOutput("out", result);
  } catch (e) {
    setFailed(`Action failed with error: ${e}`);
  }
}

run();
