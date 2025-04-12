import {
  commands,
  window,
  languages,
  ExtensionContext,
  TextEditor,
  Diagnostic,
  OutputChannel,
  env,
  workspace,
} from "vscode";
import { writeFile } from "fs-extra";
import { join } from "path";
import { extractContext } from "./contextExtractor";
import { getTerminalOutput } from "./modules/runtimeErrors";
import { formatErrorMessage } from "./utils/helpers";

const output: OutputChannel = window.createOutputChannel(
  "Debug Context",
  "json"
);

export function activate(context: ExtensionContext) {
  const generateDisposable = commands.registerCommand(
    "vibe-debug.generate",
    async () => {
      try {
        const editor: TextEditor | undefined = window.activeTextEditor;
        const diagnostics: Diagnostic[] = editor
          ? languages.getDiagnostics(editor.document.uri)
          : [];

        const debugContext = await extractContext(editor, diagnostics);
        const formattedOutput = JSON.stringify(debugContext, null, 2);

        output.clear();
        output.appendLine(formattedOutput);
        output.show(true);

        const tempPath = join(
          workspace.workspaceFolders?.[0]?.uri.fsPath || __dirname,
          "debug-context.json"
        );
        await writeFile(tempPath, formattedOutput);

        await env.clipboard.writeText(formattedOutput);
        window.showInformationMessage("Debug context copied!");
      } catch (error) {
        console.error("Vibe Debug Error:", error);
        window.showErrorMessage(`Error: ${formatErrorMessage(error)}`);
      }
    }
  );

  const pasteLogsDisposable = commands.registerCommand(
    "extension.pasteTerminalLogs",
    async () => {
      try {
        const logs = await getTerminalOutput();
        if (logs) {
          const editor: TextEditor | undefined = window.activeTextEditor;
          if (editor) {
            await editor.edit((editBuilder) => {
              editBuilder.insert(
                editor.selection.active,
                `\nTerminal Logs:\n${logs}\n`
              );
            });
          } else {
            await env.clipboard.writeText(logs);
            window.showInformationMessage("Terminal logs copied to clipboard");
          }
        } else {
          window.showWarningMessage("No terminal logs found");
        }
      } catch (err) {
        console.error("Paste Logs Error:", err);
        window.showErrorMessage(
          `Failed to paste logs: ${formatErrorMessage(err)}`
        );
      }
    }
  );

  context.subscriptions.push(generateDisposable, pasteLogsDisposable);
}

export function deactivate() {}
