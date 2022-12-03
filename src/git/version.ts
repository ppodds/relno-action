import { debug, getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { info } from "console";
import { gt, lt, valid } from "semver";
import { simpleGit } from "simple-git";

export function getEndVersion(): string {
  const inputVersion = getInput("to", { required: false });
  if (inputVersion !== "") return inputVersion;
  if (context.eventName === "release") return context.payload.release.tag_name;
  throw new Error("No version was found or provided");
}

/**
 * Get the version which would be the start of the changelog
 * @param targetVersion The version which would be the end of the changelog
 * @returns If input from is provided, return it. Otherwise, return the previous version.
 * If no previous version is found, return the first commit.
 */
export async function getStartVersion(targetVersion?: string): Promise<string> {
  const inputVersion = getInput("from", { required: false });
  if (inputVersion !== "") return inputVersion;
  info("Find previous version according to target version");
  const token = getInput("token", { required: false });
  if (token === "") throw new Error("No GitHub token was provided");
  if (!targetVersion)
    throw new Error("No target version was provided to compare to");
  if (!valid(targetVersion))
    throw new Error("The target version is not a valid semver version");
  const octokit = getOctokit(token);
  const res = await octokit.rest.git.listMatchingRefs({
    ...context.repo,
    ref: "tags",
  });
  const tags = res.data
    .map((tagObj) => tagObj.ref.replace("refs/tags/", ""))
    .filter((tag) => valid(tag) !== null)
    .sort((a, b) => {
      const tagA = valid(a) as string;
      const tagB = valid(b) as string;
      if (lt(tagA, tagB)) return -1;
      if (gt(tagA, tagB)) return 1;
      return 0;
    })
    .reverse();
  debug(`Found tags: ${tags.join(", ")}`);
  const index = tags.indexOf(targetVersion);
  if (index === -1) throw new Error("Target version not found in tags");
  const result = tags.at(index + 1);
  if (result) return result;
  // find oldest commit instead
  info("No previous version was found, using oldest commit instead");
  return (await simpleGit().log()).all[-1].hash;
}
