import { readdir } from "fs-extra";
import { join } from "path";
import {
  shouldIgnoreDir,
  isDebugRelevantFile,
  sortTreeNodes,
  formatTree,
} from "../utils/helpers";

export async function getDirectoryStructure(
  workspace: string,
  filePath: string
): Promise<string[]> {
  const maxDepth = 3;

  interface TreeNode {
    name: string;
    isDir: boolean;
    children: TreeNode[];
  }

  async function buildTree(dir: string, depth = 0): Promise<TreeNode[]> {
    if (depth > maxDepth) return [];

    const nodes: TreeNode[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (shouldIgnoreDir(entry.name)) continue;
        if (entry.isFile() && !isDebugRelevantFile(entry.name)) continue;

        const node: TreeNode = {
          name: entry.name,
          isDir: entry.isDirectory(),
          children: [],
        };

        if (node.isDir) {
          const fullPath = join(dir, entry.name);
          node.children = await buildTree(fullPath, depth + 1);
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
  return tree.length ? formatTree(tree) : ["No relevant files found"];
}
