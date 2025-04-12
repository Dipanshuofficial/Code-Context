import { TextEditor, workspace, Diagnostic } from "vscode";
import { DebugContext } from "./types";
import { getTechStack } from "./modules/techStack";
import { promptForGoal } from "./modules/projectGoal";
import { getDirectoryStructure } from "./modules/directoryStructure";
import { getModuleInteractions } from "./modules/moduleInteractions";
import { getErrorContext } from "./modules/errorContext";
import { getRecentChanges } from "./modules/recentChanges";
import { getEnvironment } from "./modules/environment";
import { getRuntimeErrorContext } from "./modules/runtimeErrors";

export async function extractContext(
  editor: TextEditor | undefined,
  diagnostics: readonly Diagnostic[]
): Promise<DebugContext> {
  const workspacePath = workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspacePath) {
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
    runtimeErrorContext: { logFileErrors: [] },
  };

  await Promise.allSettled([
    getTechStack(workspacePath).then((stack) => {
      context.techStack = stack;
    }),
    promptForGoal().then((goal) => {
      context.projectGoal = goal;
    }),
    getDirectoryStructure(workspacePath, filePath).then((structure) => {
      context.directoryStructure = structure;
    }),
    getModuleInteractions(filePath).then((interactions) => {
      context.moduleInteractions = interactions;
    }),
    Promise.resolve(getErrorContext(editor, diagnostics)).then((error) => {
      context.errorContext = error;
    }),
    getRecentChanges(workspacePath).then((changes) => {
      context.recentChanges = changes;
    }),
    getEnvironment(workspacePath).then((env) => {
      context.environment = env;
    }),
    getRuntimeErrorContext(workspacePath).then((runtimeErrors) => {
      context.runtimeErrorContext = runtimeErrors;
    }),
  ]);

  return context;
}
