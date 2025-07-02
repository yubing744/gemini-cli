# systemPatterns.md

**Purpose:**  
Documents system architecture, key technical decisions, design patterns in use, component relationships, and critical implementation paths.

---

## System Architecture Overview
Gemini CLI is structured as a modular system with two main packages:
- **CLI package (`packages/cli`)**: Handles user input, output, session management, theming, and configuration.
- **Core package (`packages/core`)**: Acts as the backend, orchestrating requests to the Gemini API, managing tool execution, and maintaining state.
- **Tools**: Extensible modules (in `packages/core/src/tools/`) for file system, shell, web, and memory operations, as well as integration with MCP servers.

Interaction flow: User input → CLI → Core → Gemini API (with tool schemas) → Tool execution (if needed) → Response back to CLI.


## Key Technical Decisions
- **Separation of concerns**: CLI and Core are decoupled for modularity and extensibility.
- **Tool-based extensibility**: Tools are registered and managed by Core, allowing new capabilities to be added easily.
- **Sandboxing**: Sensitive operations are executed in a sandboxed environment for security.
- **User confirmation**: Destructive or sensitive tool actions require explicit user approval.
- **Support for multimodal and large-context operations**: Designed to leverage Gemini's advanced model features.


## Design Patterns in Use
- **REPL (Read-Eval-Print Loop)**: Interactive terminal session for user prompts and responses.
- **Command pattern**: CLI commands and tool invocations are handled as discrete actions.
- **Plugin/extension pattern**: Tools and MCP servers can be added to extend functionality.
- **Schema-driven tool invocation**: Tool definitions and parameters are described via JSON schemas.


## Component Relationships
- CLI (frontend) sends user input to Core (backend).
- Core manages session state, tool registry, and communication with Gemini API.
- Tools are invoked by Core based on model requests.
- MCP servers act as bridges for external integrations.
- Responses flow back from Core to CLI for user display.


## Critical Implementation Paths
- User prompt → CLI → Core → Gemini API → (Tool call if needed) → Tool execution → Result → Gemini API → Core → CLI → User.
- Tool execution may require user confirmation and/or sandboxing.
- Configuration, authentication, and theming are managed at the CLI level but can affect Core behavior.


## Revision History
- 2025-07-02: Initialized and updated with content from architecture and tool documentation.
