import { join } from "path";
import { readFileSafe } from "../utils/helpers";

export async function getEnvironment(
  workspace: string
): Promise<{ runtime: string; docker?: boolean }> {
  const env: { runtime: string; docker?: boolean } = {
    runtime: process.version,
  };
  const dockerPath = join(workspace, "Dockerfile");

  const dockerContent = await readFileSafe(dockerPath);
  if (dockerContent) {
    env.docker = true;
  }

  return env;
}
