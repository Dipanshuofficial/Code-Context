import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import { parseModule } from "esprima";
import type { Program, ImportDeclaration } from "estree";
import { shouldIgnoreDir } from "./utils/helpers";

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

interface TechStack {
  node?: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  python?: string[];
}

interface ErrorContext {
  message: string;
  line: number;
  snippet: string;
}

interface DebugContext {
  techStack: TechStack;
  projectGoal: string;
  directoryStructure: string[];
  moduleInteractions: string[];
  errorContext: ErrorContext | string;
  recentChanges: string;
  environment: {
    runtime: string;
    docker?: boolean;
  };
}

export async function extractContext(
  editor: vscode.TextEditor | undefined,
  diagnostics: readonly vscode.Diagnostic[]
): Promise<DebugContext> {
  const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspace) {
    throw new Error("No workspace found");
  }

  const filePath = editor?.document.uri.fsPath ?? "";
  const context: DebugContext = {
    techStack: {},
    projectGoal: "",
    directoryStructure: [],
    moduleInteractions: [],
    errorContext: "",
    recentChanges: "",
    environment: { runtime: process.version },
  };

  await Promise.allSettled([
    getTechStack(workspace).then((stack) => {
      context.techStack = stack;
    }),
    promptForGoal().then((goal) => {
      context.projectGoal = goal;
    }),
    getDirectoryStructure(workspace, filePath).then((structure) => {
      context.directoryStructure = structure;
    }),
    getModuleInteractions(filePath).then((interactions) => {
      context.moduleInteractions = interactions;
    }),
    Promise.resolve(getErrorContext(editor, diagnostics)).then((error) => {
      context.errorContext = error;
    }),
    getRecentChanges(workspace).then((changes) => {
      context.recentChanges = changes;
    }),
    getEnvironment(workspace).then((env) => {
      context.environment = env;
    }),
  ]);

  return context;
}

async function getTechStack(workspace: string): Promise<TechStack> {
  const stack: TechStack = {};
  const pkgPath = path.join(workspace, "package.json");
  const reqPath = path.join(workspace, "requirements.txt");

  try {
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath).catch(() => ({}));
      stack.node = {
        dependencies: pkg.dependencies ?? {},
        devDependencies: pkg.devDependencies ?? {},
      };
    }
  } catch {
    // Silent fail
  }

  try {
    if (await fs.pathExists(reqPath)) {
      const reqs = await fs.readFile(reqPath, "utf-8").catch(() => "");
      stack.python = reqs
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));
    }
  } catch {
    // Silent fail
  }

  return stack;
}

async function promptForGoal(): Promise<string> {
  const goal = await vscode.window.showInputBox({
    prompt: 'Describe project goal (e.g., "ML model for fraud detection")',
    placeHolder: "Enter goal",
  });
  return goal ?? "Did Not Specify...";
}

async function getDirectoryStructure(
  workspace: string,
  filePath: string
): Promise<string[]> {
  const maxDepth = 3;

  async function walk(dir: string, depth = 0): Promise<string[]> {
    if (depth > maxDepth) return [];

    const results: string[] = [];
    let files: string[] = [];

    try {
      files = await fs.readdir(dir);
    } catch {
      return results;
    }

    for (const file of files) {
      if (shouldIgnoreDir(file)) continue; // Skip early

      const fullPath = path.join(dir, file);
      let stat: fs.Stats | null = null;

      try {
        stat = await fs.stat(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        results.push(`${file}/`);
        results.push(...(await walk(fullPath, depth + 1)));
      } else if (stat.isFile() && fullPath.includes(filePath)) {
        results.push(file);
      }
    }

    return results;
  }

  return walk(workspace);
}

async function getModuleInteractions(filePath: string): Promise<string[]> {
  if (!filePath || !(await fs.pathExists(filePath))) return ["Not available"];

  let code: string;
  try {
    code = await fs.readFile(filePath, "utf-8");
  } catch {
    return ["Unable to read file"];
  }

  try {
    const ast = parse(code, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript", "dynamicImport"],
    });

    const interactions: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        interactions.push(`Static import: ${path.node.source.value}`);
      },
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type === "Import" &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === "StringLiteral"
        ) {
          interactions.push(`Dynamic import: ${path.node.arguments[0].value}`);
        } else if (
          callee.type === "Identifier" &&
          callee.name === "require" &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === "StringLiteral"
        ) {
          interactions.push(
            `CommonJS require: ${path.node.arguments[0].value}`
          );
        }
      },
    });

    return interactions.length
      ? interactions
      : ["No module interactions detected"];
  } catch (err) {
    return [`Unable to parse: ${(err as Error).message}`];
  }
}

function getErrorContext(
  editor: vscode.TextEditor | undefined,
  diagnostics: readonly vscode.Diagnostic[]
): ErrorContext | string {
  if (!editor || diagnostics.length === 0) {
    return "No errors detected";
  }

  const error = diagnostics.find((d) =>
    d.range.contains(editor.selection.active)
  );
  if (!error) {
    return "No error at cursor";
  }

  const lines = editor.document.getText().split("\n");
  const start = Math.max(0, error.range.start.line - 5);
  const end = Math.min(lines.length, error.range.end.line + 5);
  const snippet = lines.slice(start, end).join("\n");

  return {
    message: error.message,
    line: error.range.start.line + 1,
    snippet,
  };
}

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getRecentChanges(workspace: string): Promise<string> {
  try {
    const { stdout } = await execAsync(
      "git log -n 5 --pretty=format:'%h - %s (%cr)'",
      {
        cwd: workspace,
      }
    );
    return stdout.trim() || "No recent commits found";
  } catch {
    return "Git log unavailable";
  }
}

async function getEnvironment(
  workspace: string
): Promise<{ runtime: string; docker?: boolean }> {
  const env: { runtime: string; docker?: boolean } = {
    runtime: process.version,
  };
  const dockerPath = path.join(workspace, "Dockerfile");

  try {
    if (await fs.pathExists(dockerPath)) {
      env.docker = true;
    }
  } catch {
    // Silent fail
  }

  return env;
}
