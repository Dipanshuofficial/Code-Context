import { join } from "path";
import { TechStack } from "../types";
import { readJsonSafe, readFileSafe } from "../utils/helpers";

export async function getTechStack(workspace: string): Promise<TechStack> {
  const stack: TechStack = {};
  const pkgPath = join(workspace, "package.json");
  const reqPath = join(workspace, "requirements.txt");

  const pkg = await readJsonSafe<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(pkgPath);
  if (pkg.dependencies || pkg.devDependencies) {
    stack.node = {
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
    };
  }

  const reqs = await readFileSafe(reqPath);
  if (reqs) {
    stack.python = reqs
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));
  }

  return stack;
}
