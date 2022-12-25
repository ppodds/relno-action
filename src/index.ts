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
import { Config, Generator, ReleaseMetadata, compareCommit } from "relno";
import { setReleaseNote, getEndVersion, getStartVersion } from "./github";

/**
 * Check if the runtime is valid
 */
function checkRuntime() {
  info(`Triggered by: ${context.eventName}`);
  if (context.eventName !== "release")
    throw new Error("This action only support release event");
  if (getInput("token", { required: true }) === "")
    throw new Error("No GitHub token was provided");
  startGroup("GitHub context payload");
  info(`event name: ${context.eventName}`);
  info(`event action: ${context.payload.action}`);
  info(`event release:\n${JSON.stringify(context.payload.release, null, 2)}`);
  endGroup();
}

async function run() {
  try {
    checkRuntime();
    const config = new Config();
    info("Loading config");
    await config.load();
    startGroup("Config settings");
    info(`template:\n${config.template}`);
    info(`prTypes:\n${JSON.stringify(config.prTypes)}`);
    endGroup();
    const token = getInput("token", { required: true });
    const to = getEndVersion();
    const from = await getStartVersion(token, to);
    info(`Comparing from ${from} to ${to}`);
    const log = await compareCommit(from, to);
    debug(`Found commits:\n${JSON.stringify(log, null, 2)}`);
    const release = context.payload.release;
    const metadata: ReleaseMetadata = {
      authorLogin: release.author?.login ?? "",
      authorName: release.author?.name ?? "",
      authorEmail: release.author?.email ?? "",
      createdAt: release.created_at ?? "",
      discussionUrl: release.discussion_url ?? "",
      htmlUrl: release.html_url,
      id: release.id.toString(),
      name: release.name ?? "",
      publishedAt: release.published_at ?? "",
      tagName: release.tag_name,
      fromVersion: from,
      tarballUrl: release.tarball_url ?? "",
      targetCommitish: release.target_commitish,
      zipballUrl: release.zipball_url ?? "",
      compareUrl: `https://github.com/${context.repo.owner}/${context.repo.repo}/compare/${from}...${to}`,
    };
    debug(`Release metadata: ${JSON.stringify(metadata, null, 2)}`);
    const generator = new Generator(log, {
      template: config.template ?? "",
      prTypes: config.prTypes ?? [],
      metadata,
    });
    info("Generating changelog");
    const result = generator.generate();
    info(`Generated release note:\n${result}`);
    debug(`${context.payload}`);
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
    setOutput("release-note", result);
  } catch (e) {
    setFailed(`Action failed with error: ${e}`);
  }
}

run();
