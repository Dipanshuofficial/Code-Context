# vibe-debug — VS Code Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![VS Code Marketplace](https://img.shields.io/badge/Marketplace-vibe--debug-blue)](https://marketplace.visualstudio.com/vscode)

**vibe-debug** creates a structured snapshot of your codebase, empowering developers and AI tools (like LLMs) to debug faster with rich context.

---

## 🚀 Features

- **Comprehensive Context Extraction**:
  - 🛠️ **Tech Stack**: Detects Node.js, Python dependencies.
  - 🎯 **Project Goal**: Captures via user prompt.
  - 📂 **Directory Structure**: Scans up to 3 levels deep.
  - 🔗 **Module Interactions**: Analyzes imports statically.
  - 🐞 **Error Context**: Pinpoints issues at cursor.
  - 🖥️ **Runtime Environment**: Logs Node.js version, Docker usage.
  - 📝 **Recent Changes**: Tracks Git commits (coming soon).
- **Seamless Output**:
  - 📤 JSON to clipboard and Output panel.
  - 💾 Saves to `debug-context.json` in workspace.
- **Quick Access**:
  - ⚡ Command: `Generate Debug Context` (`Ctrl+Shift+P`).
  - 📜 Paste terminal logs with `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`).

---

## 📦 Installation

1. Open **VS Code**.
2. Go to **Extensions** (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for **`vibe-debug`**.
4. Click **Install**.

**Manual Install**:
- Download the `.vsix` file from [Releases](https://github.com/Dipanshuofficial/vibe-debug/releases).
- Use `Install from VSIX...` in VS Code.

---

## 🛠️ Requirements

- **VS Code**: `1.85.0` or higher.
- **Node.js**: `16.0.0` or higher (for runtime detection).

---

## 🎮 Usage

1. Open a project in VS Code.
2. Run `Generate Debug Context` via:
   - **Command Palette**: `Ctrl+Shift+P` → Search `Generate Debug Context`.
   - **Context Menu**: Right-click in editor → Select `Generate Debug Context`.
3. View output in:
   - **Output Panel**: `vibe-debug` channel.
   - **Clipboard**: Paste anywhere.
   - **File**: `debug-context.json` in workspace.
4. Paste terminal logs with `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`).

**Example Output**:
```json
{
  "techStack": { "node": { "dependencies": { "express": "^4.17.1" } } },
  "projectGoal": "Build REST API",
  "directoryStructure": ["src/", "src/index.js"],
  "errorContext": { "message": "Cannot read property", "line": 10 }
}
```

---

## ⚙️ Settings

No configuration needed—works out of the box!

---

## 🐞 Known Issues

- Git commit history extraction incomplete (planned for v0.0.2).
- JSX/TSX parsing may miss edge cases (Babel upgrade in progress).

File issues on [GitHub](https://github.com/Dipanshuofficial/vibe-debug/issues).

---

## 🗒️ Release Notes

### 0.0.1
- Initial release.
- Context extraction for Node.js/Python.
- JSON output, clipboard, file support.
- Optimized directory scanning with caching.

---

## 🤝 Contributing

We’d love your help! Fork, submit PRs, or report issues on [GitHub](https://github.com/Dipanshuofficial/vibe-debug).

**Local Setup**:
```bash
git clone https://github.com/Dipanshuofficial/vibe-debug.git
cd vibe-debug
npm install
npm run build
```
Press `F5` in VS Code to test.

---

## 📜 License

Licensed under the [MIT License](LICENSE).

---

## 🌟 Why vibe-debug?

Save time debugging by sharing rich, structured context with teammates or AI assistants. Built for developers, by developers.

Follow us on [GitHub](https://github.com/Dipanshuofficial) for updates!
```

### Improvements Made

- **Marketplace-Friendly**:
  - Added badges for license and Marketplace link.
  - Included keywords (debug, context, codebase) for searchability.
  - Clear installation steps with manual `.vsix` option.
- **GitHub-Friendly**:
  - Linked to repo (`Dipanshuofficial/vibe-debug`).
  - Detailed contributing guide with clone/build steps.
- **Concise Structure**:
  - Shortened feature descriptions.
  - Added usage example with JSON output.
- **Visual Appeal**:
  - Consistent emojis and headings.
  - Example output for clarity.
- **Completeness**:
  - Covered requirements, settings, issues.
  - Updated release notes to reflect optimizations.

### Git Commands to Commit

```bash
git add README.md
git commit -m "Updated README for Marketplace and GitHub"
git push origin main
```

- **File**: `README.md`.
- **Message**: Reflects Marketplace/GitHub optimization.
- **Push**: Updates `main` branch.

### Notes

- **Repo URL**: Assumed `Dipanshuofficial/vibe-debug`; replace if different.
- **Badges**: Marketplace badge links to VS Code; update post-publishing.
- **Issues Link**: Points to GitHub issues for community feedback.
- **Verify**: Preview in VS Code or GitHub to ensure Markdown renders correctly.
