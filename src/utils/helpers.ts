import { readFile, readJson } from "fs-extra";
import { extname, join } from "path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vscode",
  "out",
  ".turbo",
  "__pycache__",
  ".cache",
]);

const DEBUG_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".css",
  ".config.js",
];

const IGNORE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ttf",
  ".woff",
  ".woff2",
];

const PRIORITY_FILES = ["package.json", "app.json", "babel.config.js"];

export function shouldIgnoreDir(dirName: string): boolean {
  return IGNORED_DIRS.has(dirName) || dirName.startsWith(".");
}

export function isDebugRelevantFile(fileName: string): boolean {
  const ext = extname(fileName).toLowerCase();
  return (
    DEBUG_EXTENSIONS.includes(ext) ||
    PRIORITY_FILES.includes(fileName) ||
    !IGNORE_EXTENSIONS.includes(ext)
  );
}

export function sortTreeNodes<T extends { name: string; isDir: boolean }>(
  nodes: T[]
): T[] {
  return nodes.sort((a, b) => {
    const aPriority = PRIORITY_FILES.includes(a.name) ? -2 : a.isDir ? -1 : 0;
    const bPriority = PRIORITY_FILES.includes(b.name) ? -2 : b.isDir ? -1 : 0;
    return aPriority - bPriority || a.name.localeCompare(b.name);
  });
}

export function formatTree(
  nodes: { name: string; isDir: boolean; children: any[] }[],
  prefix = "",
  depth = 0
): string[] {
  const lines: string[] = [];
  const isRoot = depth === 0;

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isRoot ? "" : isLast ? "└── " : "├── ";
    lines.push(`${prefix}${connector}${node.name}${node.isDir ? "/" : ""}`);

    if (node.children.length) {
      const childPrefix = prefix + (isRoot ? "" : isLast ? "    " : "│   ");
      lines.push(...formatTree(node.children, childPrefix, depth + 1));
    }
  });

  return lines;
}

export async function readFileSafe(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}

export async function readJsonSafe<T>(filePath: string): Promise<T> {
  try {
    return await readJson(filePath);
  } catch {
    return {} as T;
  }
}

export function formatErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export function truncateString(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str;
}
