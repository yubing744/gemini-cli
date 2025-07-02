# System Patterns

## Architecture Patterns

### Monorepo Organization
- **Package Separation**: Clear boundaries between CLI and core functionality
- **Shared Dependencies**: Common tooling and configuration across packages
- **Independent Deployment**: Packages can be published and versioned separately

### Service-Oriented Design
- **Authentication Services**: Modular auth providers (API key, OAuth, DID)
- **Configuration Services**: Hierarchical config management
- **Chat Services**: AI interaction orchestration
- **Tool Services**: Extensible tool integration system

### Dependency Injection
- **Service Registration**: Services register with dependency container
- **Interface-Based**: Services depend on interfaces, not implementations
- **Configuration-Driven**: Service behavior controlled by configuration

## Key Design Patterns

### Strategy Pattern
**Authentication**: Multiple auth strategies (API key, OAuth, DID)
```typescript
interface AuthStrategy {
  authenticate(): Promise<AuthResult>;
  buildAuthHeader(payload: unknown): Promise<string>;
}

class ApiKeyAuth implements AuthStrategy { ... }
class OAuthAuth implements AuthStrategy { ... }
class NuwaDidAuth implements AuthStrategy { ... }
```

### Factory Pattern
**Service Creation**: Dynamic service instantiation based on configuration
```typescript
class ServiceFactory {
  createAuthService(config: AuthConfig): AuthService {
    switch (config.type) {
      case 'api-key': return new ApiKeyAuthService(config);
      case 'oauth': return new OAuthAuthService(config);
      case 'did': return new NuwaAuthService(config);
    }
  }
}
```

### Observer Pattern
**Event System**: Component communication through events
- Configuration changes trigger service updates
- Authentication state changes notify dependent services
- Tool execution results broadcast to interested components

### Builder Pattern
**Configuration Assembly**: Complex configuration object construction
```typescript
class ConfigBuilder {
  withAuth(authConfig: AuthConfig): ConfigBuilder { ... }
  withTheme(themeConfig: ThemeConfig): ConfigBuilder { ... }
  withTools(toolConfig: ToolConfig[]): ConfigBuilder { ... }
  build(): GeminiConfig { ... }
}
```

## Component Relationships

### Core Package Dependencies
```
GeminiChat (orchestrator)
├── AuthService (authentication)
├── ConfigService (configuration)
├── ContentGenerator (AI requests)
├── ToolScheduler (tool execution)
└── TelemetryService (analytics)
```

### CLI Package Dependencies
```
App (main CLI component)
├── CommandParser (argument handling)
├── ThemeManager (UI styling)
├── SessionManager (conversation state)
└── CoreClient (core package interface)
```

## Critical Implementation Paths

### Authentication Flow
1. **Service Discovery**: Determine available auth methods
2. **Strategy Selection**: Choose auth strategy based on config/user choice
3. **Credential Acquisition**: Handle auth flow (API key input, OAuth, DID)
4. **Session Establishment**: Create authenticated session
5. **Request Signing**: Add auth headers to API requests

### Chat Session Lifecycle
1. **Initialization**: Load config, establish auth, prepare tools
2. **Input Processing**: Parse user input, determine intent
3. **Tool Execution**: Execute any required tools
4. **AI Request**: Send context and query to Gemini API
5. **Response Processing**: Format and display AI response
6. **State Persistence**: Save conversation state and context

### Configuration Resolution
1. **Environment Variables**: Load system-level settings
2. **Global Config**: Load user-wide configuration
3. **Project Config**: Load project-specific settings
4. **Runtime Overrides**: Apply command-line arguments
5. **Validation**: Ensure config completeness and validity

## Error Handling Patterns

### Graceful Degradation
- **Network Failures**: Offline mode with cached responses
- **Auth Failures**: Fallback to alternative auth methods
- **Tool Failures**: Continue chat without failed tools

### Error Boundaries
- **Service Isolation**: Service failures don't crash entire application
- **Recovery Mechanisms**: Automatic retry with exponential backoff
- **User Communication**: Clear error messages with actionable guidance

## Security Patterns

### Credential Management
- **Secure Storage**: OS keychain/credential manager integration
- **Encryption**: Sensitive data encrypted at rest
- **Minimal Exposure**: Credentials only loaded when needed

### Request Security
- **TLS/HTTPS**: All external communication encrypted
- **Request Signing**: DID-based cryptographic request signing
- **Input Validation**: Sanitize all user inputs

### Sandbox Isolation
- **Tool Execution**: Isolated execution environment for tools
- **File System**: Controlled file system access
- **Network**: Restricted network access for tools
