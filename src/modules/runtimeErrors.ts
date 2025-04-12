import { window, env, commands } from "vscode";
import { readdir } from "fs-extra";
import { join, basename } from "path";
import {
  readFileSafe,
  shouldIgnoreDir,
  truncateString,
  getGitignore, // Add this
} from "../utils/helpers";
import ignore from "ignore";

const logFilesCache = new Map<string, { timestamp: number; files: string[] }>();
const CACHE_TTL = 60 * 1000;

export async function getRuntimeErrorContext(workspace: string): Promise<{
  logFileErrors: string[];
  stderrOutput?: string;
}> {
  const context: { logFileErrors: string[]; stderrOutput?: string } = {
    logFileErrors: [],
  };

  const logFiles = await findLogFiles(workspace);
  for (const logFile of logFiles) {
    const content = await readFileSafe(logFile);
    const errors = parseLogErrors(content);
    if (errors.length) {
      context.logFileErrors.push(
        ...errors.map((e) => `${basename(logFile)}: ${truncateString(e, 100)}`)
      );
    }
  }

  const terminalOutput = await getTerminalOutput();
  if (terminalOutput) {
    context.stderrOutput = truncateString(terminalOutput, 500);
  }

  return context;
}

export async function findLogFiles(workspace: string): Promise<string[]> {
  // Check cache
  const cached = logFilesCache.get(workspace);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.files;
  }

  // Load .gitignore
  // Load .gitignore
  const gitignore = getGitignore(workspace);

  const files: string[] = [];
  async function walk(dir: string, relativeDir = ""): Promise<void> {
    try {
      // Early exit for ignored dirs
      const dirName = relativeDir.split("/").pop() || dir;
      if (shouldIgnoreDir(dirName)) return;
      if (gitignore && relativeDir && gitignore.ignores(relativeDir)) return;

      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const entryRelativePath = relativeDir
          ? join(relativeDir, entry.name)
          : entry.name;

        if (gitignore && gitignore.ignores(entryRelativePath)) continue;
        if (shouldIgnoreDir(entry.name)) continue;

        if (entry.isDirectory()) {
          await walk(fullPath, entryRelativePath);
        } else if (entry.name.endsWith(".log")) {
          files.push(fullPath);
        }
      }
    } catch {
      // Silent fail
    }
  }
  await walk(workspace);
  const result = files;
  logFilesCache.set(workspace, { timestamp: Date.now(), files: result });
  return result;
}

export function parseLogErrors(content: string): string[] {
  const errors: string[] = [];
  const lines = content.split("\n");
  const errorPatterns = [
    /error:/i,
    /exception:/i,
    /failed:/i,
    /traceback:/i,
    /err\s/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (errorPatterns.some((pattern) => pattern.test(line))) {
      const snippet = lines
        .slice(i, i + 3)
        .join("\n")
        .trim();
      errors.push(snippet);
    }
  }

  return errors;
}

export async function getTerminalOutput(): Promise<string | undefined> {
  const activeTerminal = window.terminals.find(
    (t) => t === window.activeTerminal
  );
  if (!activeTerminal) return undefined;

  let outputChannel = window.createOutputChannel("DebugContext");
  try {
    activeTerminal.show();
    await commands.executeCommand("workbench.action.terminal.selectAll");
    await commands.executeCommand("workbench.action.terminal.copySelection");
    return (await env.clipboard.readText()).trim() || undefined;
  } finally {
    outputChannel.dispose();
  }
}
