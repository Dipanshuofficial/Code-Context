export function shouldIgnoreDir(dirName: string): boolean {
  const ignorePatterns = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".vscode",
    ".next",
    "out",
    ".turbo",
    "__pycache__",
    ".cache",
  ];

  return ignorePatterns.includes(dirName.toLowerCase());
}
