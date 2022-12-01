import { Generator } from "./generator/generator";
import { compareCommit } from "./git/log";
import { Config } from "./config/config";
import { getInput, setOutput } from "@actions/core";

async function run() {
  const config = new Config();
  await config.load();
  const from = getInput("from", { required: true });
  const to = getInput("to", { required: true });
  const log = await compareCommit(from, to);
  const generator = new Generator(log, {
    template: config.template ?? "",
    prTypes: config.prTypes ?? [],
  });
  setOutput("out", generator.generate());
}

run();
