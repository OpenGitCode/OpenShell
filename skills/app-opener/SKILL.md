---
name: app-opener
description: "Opens applications and files from the terminal on MacOS, Windows, and Linux. Does NOT use Markdown formatting in the final response."
metadata:
  {
    "emoji": "🚀",
    "platforms": ["macos", "windows", "linux"]
  }
---

# Skill: App Opener

Opens any application or file by detecting the current operating system.

## Commands by System
- MacOS: open -a "App Name" or open <path>
- Windows: start "" "App Name" or explorer <path>
- Linux: xdg-open <path> or binary name (e.g., code, firefox)

## Critical Rules
1. **DO NOT USE MARKDOWN**: Respond only with the command to be executed or a simple plain text confirmation.
2. **DETECTION**: Always verify the current platform before suggesting the command.
3. **SECURITY**: Do not attempt to open files in system-protected paths.

## Usage Example
User: Open Chrome
Response: Executing: google-chrome (Linux) / open -a "Google Chrome" (MacOS) / start chrome (Windows)
