# progress.md

**Purpose:**  
Tracks what works, what's left to build, current status, known issues, and the evolution of project decisions.

---

## What Works
- Interactive CLI for Gemini model interaction.
- Built-in tools for file system, shell, web fetch/search, and memory.
- Support for authentication, configuration, and theming.
- Extensible tool and MCP server integration.
- Sandboxed execution and user confirmation for sensitive operations.
- Comprehensive documentation and troubleshooting guides.

## What's Left to Build
- Additional tool integrations and MCP server examples.
- Enhanced error handling and user feedback.
- Expanded support for more authentication methods and enterprise use cases.
- Further improvements to sandboxing and security.
- More usage tutorials and advanced workflow documentation.

## Current Status
Gemini CLI is functional and supports a wide range of developer workflows. The core architecture and main features are stable, with ongoing improvements focused on extensibility, security, and user experience.

## Known Issues
- Some authentication flows (e.g., Google Workspace) may require workarounds.
- Port conflicts can occur when running MCP servers.
- CLI may not be in PATH if not installed globally.
- Dependency or build errors may occur if setup steps are missed.
- Sandboxing may restrict some operations; configuration may be needed.
- Large or binary files may be skipped or truncated by file tools.

## Evolution of Project Decisions
- Adopted modular CLI/Core split for maintainability and extensibility.
- Introduced tool schema and confirmation model for safety.
- Added sandboxing and Docker support for secure execution.
- Iteratively improved documentation and troubleshooting resources.

## Revision History
- 2025-07-02: Initialized and updated with content from troubleshooting and deployment documentation.
