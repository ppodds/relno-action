import { Generator } from "./generator/generator";
import { compareCommit } from "./git/log";
import { Config } from "./config/config";
import {
  debug,
  endGroup,
  getInput,
  info,
  setFailed,
  setOutput,
  startGroup,
} from "@actions/core";
import { context } from "@actions/github";
import { getEndVersion, getStartVersion } from "./git/version";
import { setReleaseNote } from "./github/release";

async function run() {
  try {
    const config = new Config();
    info("Loading config");
    await config.load();
    startGroup("Config settings");
    info(`template: \n${config.template}`);
    info(`prTypes: \n${config.prTypes?.map((e) => JSON.stringify(e))}`);
    endGroup();
    const token = getInput("token", { required: false });
    if (token === "") throw new Error("No GitHub token was provided");
    info(`Triggered by: ${context.eventName}`);
    const to = getEndVersion();
    const from = await getStartVersion(token, to);
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
    debug(`${context.payload}`);
    startGroup("GitHub context payload");
    info(`event name: ${context.eventName}`);
    info(`event action: ${context.payload.action}`);
    info(`event release: ${JSON.stringify(context.payload.release)}`);
    endGroup();
    if (context.eventName === "release") {
      if (
        (context.payload.action === "created" ||
          context.payload.action === "published" ||
          context.payload.action === "released" ||
          context.payload.action === "prereleased" ||
          context.payload.action === "edited") &&
        (!context.payload.release.body ||
          !context.payload.release.body.includes(
            "<!-- Generate by Release Note -->",
          ))
      ) {
        info("Updating release note");
        await setReleaseNote(token, result);
      }
    }
    setOutput("release-note", result);
  } catch (e) {
    setFailed(`Action failed with error: ${e}`);
  }
}

run();
