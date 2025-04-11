```markdown
# 🧠 vibe-debug — VSCode Extension

**vibe-debug** generates a complete, structured snapshot of your workspace to help LLMs or humans debug your code faster.

---

## ✨ Features

- 🧰 Extracts:
  - **Tech Stack** (Node.js, Python)
  - **Project Goal** (via prompt)
  - **Directory Structure** (up to 3 levels)
  - **Module Interactions** (via static analysis)
  - **Error Context** (based on active cursor)
  - **Runtime Environment**
- 📤 Outputs JSON to:
  - VSCode Output panel
  - System Clipboard
- ⚡ Quick trigger via Command Palette (`Generate Debug Context`)

---

## 📦 Requirements

- **VS Code** `1.85.0+`
- **Node.js** `v16+`

---

## 🔧 Extension Settings

None required.

---

## 🐞 Known Issues

- `git`-based recent changes are not yet implemented.
- JSX/TSX files aren't fully parsed (planned fix via Babel parser).

---

## 🚀 Install

1. Open **VS Code**
2. Go to Extensions View (`Ctrl+Shift+X`)
3. Install via:
   - **Search**: `vibe-debug` *(after publishing)*
   - or **Manual**: `Install from VSIX...`

---

## 🧪 Release Notes

### v0.0.1
- Initial release
- Full context extraction for Node.js and Python projects
- JSON output and clipboard support

---

## 🤝 Contributing

We welcome PRs, issues, and ideas!  
Stay tuned for GitHub link.

To run locally:

```bash
git clone https://github.com/YOUR_USERNAME/vibe-debug.git
cd vibe-debug
npm install
npm run compile
```

---

## 🪪 License

[MIT](./LICENSE)
```