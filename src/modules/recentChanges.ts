import { simpleGit, LogResult } from "simple-git";
import { formatErrorMessage, truncateString } from "../utils/helpers";

export async function getRecentChanges(workspace: string): Promise<string> {
  const git = simpleGit(workspace, { config: [] });

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return "No git repository initialized in workspace";
    }

    const log: LogResult = await git.log({ maxCount: 3 });
    if (!log.all.length) return "No recent commits found";

    let output = "Recent Commits:\n";
    for (const commit of log.all) {
      output += `${commit.hash.slice(0, 7)} - ${truncateString(
        commit.message,
        50
      )} (${commit.date})\n`;

      const diff = await git.show([
        `${commit.hash}`,
        "--name-only",
        "--format=",
      ]);
      const files = diff
        .split("\n")
        .filter((line) => line.trim())
        .map((file) => `  - ${file}`);
      if (files.length) {
        output += "Modified files:\n" + files.join("\n") + "\n";
      }
    }

    return output.trim() || "No changes detected";
  } catch (err) {
    return `Git error: ${formatErrorMessage(err)}`;
  } finally {
    git.clearQueue();
  }
}
