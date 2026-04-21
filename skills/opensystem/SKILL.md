# Skill: OpenSystem
**Category**: System / Convenience
**Identity**: Part of the OpenGit core ecosystem.

## Description
This skill enables the agent to perform system management and convenience tasks requested by the user in natural language. It acts as an interface between the user's intent and the terminal's state.

## Capabilities
- **Terminal Cleanup**: Can clear the terminal screen when the user expresses a desire for a "clean" or "empty" space.
- **Project Identity**: Knows that it belongs to OpenGit and follows the founder's (Corona) vision for a seamless CLI experience.
- **Convenience Mapping**: Converts informal requests (e.g., "limpia esto", "borra el cochinero") into technical actions.

## Tools
- `clear_terminal()`: Clears the terminal output screen immediately.
- `execute_command(command)`: For general system tasks not covered by specific tools.

## Example Interactions
- **User**: "limpia la terminal" or "hazle un clear"
- **Agent**: Calls `clear_terminal()` and responds with a fresh start.
- **User**: "me da hueva poner /clear, hazlo tú"
- **Agent**: Executes `clear_terminal()` to assist the user.

---
*OpenSystem: Making the terminal smarter and easier for the OpenGit community.*
