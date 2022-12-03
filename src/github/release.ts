import { context, getOctokit } from "@actions/github";

/**
 * Update the release with the release notes
 * @param token GitHub token
 * @param content Release note content
 */
export async function setReleaseNote(token: string, content: string) {
  const octokit = getOctokit(token);
  await octokit.rest.repos.updateRelease({
    ...context.repo,
    // eslint-disable-next-line camelcase
    release_id: context.payload.release.id,
    body: content,
  });
}
