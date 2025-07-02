# techContext.md

**Purpose:**  
Documents technologies used, development setup, technical constraints, dependencies, and tool usage patterns.

---

## Technologies Used
- Node.js (v18+)
- TypeScript (for source code)
- JavaScript (for distributed packages)
- Gemini API (Google)
- Docker (for sandboxing)
- NPM (for package management)

## Development Setup
1. Install Node.js v18 or higher.
2. Clone the repository and install dependencies with `npm install`.
3. For development, use `npm run start` for hot-reloading.
4. For production-like testing, use `npm link packages/cli` and run `gemini`.
5. To run in a sandbox, use Docker and the published sandbox image.
6. Configuration files are stored in `.gemini/settings.json` (project and home directory).

## Technical Constraints
- CLI-only interface (no GUI/web frontend).
- Operations that modify the system or files are sandboxed for security.
- Some features (e.g., token caching) depend on authentication method.
- Only Gemini models are supported.
- Large or binary files may be skipped or truncated by file tools.

## Dependencies
- `@google/gemini-cli`: User-facing CLI package.
- `@google/gemini-cli-core`: Backend logic and tool execution.
- Docker: For sandboxed execution.
- NPM: For package management and distribution.
- esbuild, tsc: For building and bundling.

## Tool Usage Patterns
- Tools are registered and managed by the Core package.
- Tool invocations are schema-driven and may require user confirmation.
- Built-in tools: file system (read/write/list/search), shell, web fetch/search, memory.
- MCP servers can be added for external integrations.
- Tools are invoked automatically by the Gemini model based on user prompts.

## Revision History
- 2025-07-02: Initialized and updated with content from deployment, architecture, and tool documentation.
