# <p align="center">🚀 OpenShell</p>

<p align="center">
  <strong>The Intelligent, Secure, and Extensible AI CLI for Modern Developers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Built%20With-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

---

## ✨ Overview

**OpenShell** is a next-generation Command Line Interface (CLI) designed to bring the power of LLMs directly to your terminal. Built with security and extensibility at its core, OpenShell allows you to automate complex tasks, manage systems, and interact with various AI providers seamlessly.

Created by **OpenGit**, it aims to be the ultimate companion for developers who want to stay in the terminal while leveraging state-of-the-art AI.

## 🌟 Key Features

- 🤖 **Multi-Provider Intelligence**: Native support for **OpenAI**, **Anthropic**, and **Ollama**. Choose the brain that fits your task.
- 🧠 **Skills System**: Teach your agent new tricks! Simply drop Markdown files into `~/.openshell/skills/` to expand its capabilities.
- 🛠️ **MCP Integration**: Fully compatible with the **Model Context Protocol**, enabling a standard way to connect AI models to data and tools.
- 🔒 **Security First**: Granular permission modes. Choose between **Manual Consent** for safety or **Autonomous Mode** for speed.
- 📜 **Context Persistence**: Model-specific conversation history managed automatically in `~/.openshell/context/`.
- ⚡ **Automations**: Built-in engine for scheduled tasks and event-driven automation.

## 🚀 Quick Start

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/OpenGitCode/OpenShell.git
   cd OpenShell
   ```

2. **Install dependencies & build**:
   ```bash
   npm install
   npm run build
   ```

3. **Link the CLI**:
   ```bash
   npm link
   ```

### Configuration

Set up your preferred AI provider and API keys:
```bash
openshell config
```

## 🛠 Usage

| Command | Description |
| :--- | :--- |
| `openshell chat` | Start an interactive AI session |
| `openshell skills` | List and manage learned skills |
| `openshell mcp` | Manage Model Context Protocol integrations |
| `openshell auto` | Configure and run automations |
| `openshell doctor` | Run system diagnostics and health checks |

## 📂 Project Structure

- `~/.openshell/skills`: Your agent's "brain" extension.
- `~/.openshell/context`: Conversation history and state.
- `~/.openshell/mcp`: MCP definition files.
- `~/.openshell/automations`: Custom automation scripts.

## 🛡 Safety & Governance

OpenShell follows strict safety guidelines:
- **Zero-Trust by Default**: The agent cannot modify core system files without explicit permission.
- **Sandboxed Operations**: Access is restricted to authorized directories.
- **Audit Logs**: Every action taken by the agent is logged for transparency.

---

<p align="center">
  Made with ❤️ by <strong>OpenGit</strong>
</p>
