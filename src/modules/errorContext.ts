import { TextEditor, Range, Diagnostic } from "vscode";
import { ErrorContext } from "../types";

export function getErrorContext(
  editor: TextEditor | undefined,
  diagnostics: readonly Diagnostic[]
): ErrorContext | string {
  if (!editor || diagnostics.length === 0) {
    return "No errors detected";
  }

  const error = diagnostics.find((d) =>
    (d.range as Range).contains(editor.selection.active)
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
