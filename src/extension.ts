import * as vscode from "vscode";
import { extractContext } from "./contextExtractor";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vibe-debug.generate",
    async () => {
      try {
        const editor = vscode.window.activeTextEditor;
        const diagnostics = editor
          ? vscode.languages.getDiagnostics(editor.document.uri)
          : [];

        const debugContext = await extractContext(editor, diagnostics);

        const output = vscode.window.createOutputChannel("Debug Context");
        output.appendLine(JSON.stringify(debugContext, null, 2));
        output.show();

        await vscode.env.clipboard.writeText(JSON.stringify(debugContext));
        vscode.window.showInformationMessage("Debug context copied!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        vscode.window.showErrorMessage(`Error: ${message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
