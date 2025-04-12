import { window } from "vscode";

export async function promptForGoal(): Promise<string> {
  const goal = await window.showInputBox({
    prompt: 'Describe project goal (e.g., "ML model for fraud detection")',
    placeHolder: "Enter goal",
  });
  return goal ?? "Did Not Specify...";
}
