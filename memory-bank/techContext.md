# Technical Context

## Technology Stack
- **Language**: TypeScript with Node.js runtime
- **Package Manager**: npm with workspace support
- **Build System**: esbuild for fast compilation
- **Testing**: Vitest for unit tests, custom integration test framework
- **Linting**: ESLint with custom rules
- **Formatting**: Prettier for code formatting

## Architecture Overview
### Monorepo Structure
```
gemini-cli/
├── packages/
│   ├── cli/          # CLI interface and UI components
│   └── core/         # Core AI chat functionality
├── docs/             # Documentation
├── integration-tests/ # Integration test suites
└── scripts/          # Build and deployment scripts
```

### Core Packages
1. **@gemini-cli/core**: Core functionality
   - AI chat orchestration
   - Authentication services
   - Configuration management
   - Tool integrations
   - Telemetry services

2. **@gemini-cli/cli**: CLI interface
   - Terminal UI components
   - Command parsing and routing
   - User interaction handling
   - Theme and display management

## Key Technologies

### Authentication Systems
- **API Key Authentication**: Direct Google API key usage
- **OAuth 2.0**: Google OAuth flow for user authentication
- **DID Authentication**: Nuwa DID system with:
  - `@nuwa-ai/identity-kit` for cryptographic operations
  - CADOP integration for authorization
  - Multibase encoding for key serialization

### AI Integration
- **Google Gemini API**: Primary AI model interface
- **Content Generation**: Structured request/response handling
- **Token Management**: Usage tracking and limits
- **Model Selection**: Support for different Gemini model variants

### Configuration Management
- **Hierarchical Config**: Environment, user, and project-level settings
- **Theme System**: Customizable color schemes and output formatting
- **Settings Persistence**: JSON-based configuration storage

## Development Setup
### Prerequisites
- Node.js 18+ 
- npm 8+
- TypeScript 5+

### Build Process
1. **Development**: `npm run dev` - Watch mode compilation
2. **Production**: `npm run build` - Optimized bundle creation
3. **Testing**: `npm test` - Unit and integration tests
4. **Linting**: `npm run lint` - Code quality checks

### Key Dependencies
- `@google/generative-ai`: Gemini API client
- `@nuwa-ai/identity-kit`: DID authentication
- `ink`: React-based terminal UI framework
- `commander`: CLI argument parsing
- `conf`: Configuration management

## Technical Constraints
- **Node.js Runtime**: Must work across Node.js 18+ environments
- **Cross-Platform**: Support Windows, macOS, Linux
- **Security**: Secure credential storage and transmission
- **Performance**: Fast startup and response times
- **Offline Capability**: Graceful degradation without network

## Integration Points
- **File System**: Local file operations and workspace integration
- **Network**: HTTP/HTTPS for API communication
- **Process**: Shell command execution and sandbox environments
- **Configuration**: OS-specific config directory handling
