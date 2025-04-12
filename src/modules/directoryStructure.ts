import { readdir } from "fs-extra";
import { join } from "path";
import {
  shouldIgnoreDir,
  isDebugRelevantFile,
  sortTreeNodes,
  formatTree,
  readFileSafe,
  getGitignore,
} from "../utils/helpers";
import ignore from "ignore"; // For .gitignore parsing

// In-memory cache for directory structures
const directoryCache = new Map<
  string,
  { timestamp: number; structure: string[] }
>();
const CACHE_TTL = 60 * 1000; // Cache for 1 minute

export async function getDirectoryStructure(
  workspace: string,
  filePath: string
): Promise<string[]> {
  // Check cache first
  const cached = directoryCache.get(workspace);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.structure;
  }

  // Load .gitignore patterns
  // Load .gitignore patterns
  const gitignore = getGitignore(workspace);

  const maxDepth = 3;

  interface TreeNode {
    name: string;
    isDir: boolean;
    children: TreeNode[];
  }

  async function buildTree(
    dir: string,
    depth = 0,
    relativeDir = ""
  ): Promise<TreeNode[]> {
    if (depth > maxDepth) return [];

    // Early exit for ignored directories
    const dirName = relativeDir.split("/").pop() || dir;
    if (shouldIgnoreDir(dirName)) return [];
    if (gitignore && relativeDir && gitignore.ignores(relativeDir)) return [];

    const nodes: TreeNode[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryRelativePath = relativeDir
          ? join(relativeDir, entry.name)
          : entry.name;

        // Skip entries ignored by .gitignore
        if (gitignore && gitignore.ignores(entryRelativePath)) continue;
        if (shouldIgnoreDir(entry.name)) continue;
        if (entry.isFile() && !isDebugRelevantFile(entry.name)) continue;

        const node: TreeNode = {
          name: entry.name,
          isDir: entry.isDirectory(),
          children: [],
        };

        if (node.isDir) {
          const fullPath = join(dir, entry.name);
          node.children = await buildTree(
            fullPath,
            depth + 1,
            entryRelativePath
          );
          if (node.children.length === 0 && depth > 0) continue;
        }

        nodes.push(node);
      }
    } catch {
      return nodes;
    }

    return sortTreeNodes(nodes);
  }

  const tree = await buildTree(workspace);
  const structure = tree.length
    ? formatTree(tree)
    : ["No relevant files found"];
  directoryCache.set(workspace, { timestamp: Date.now(), structure });
  return structure;
}
