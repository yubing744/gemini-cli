# Gemini CLI - Project Brief

## Overview
Gemini CLI is a command-line interface tool that provides AI-powered assistance through Google's Gemini API. The project is a TypeScript/Node.js monorepo with a modular architecture split into core functionality and CLI interface packages.

## Core Requirements
1. **AI Chat Interface**: Interactive CLI chat with Gemini AI models
2. **Authentication**: Support for multiple auth methods including API keys and OAuth
3. **Configuration Management**: Flexible config system for API settings, themes, and user preferences
4. **Extensible Architecture**: Plugin-like system for tools and services
5. **DID Integration**: Nuwa DID authentication system for decentralized identity

## Key Features
- Interactive chat sessions with Gemini models
- Multiple authentication methods (API key, OAuth, DID)
- Configurable themes and UI customization
- Token caching and management
- Sandbox execution environment
- Tool integration (file system, web search, memory, etc.)
- Telemetry and analytics
- Cross-platform support

## Project Structure
- **packages/cli**: CLI interface and user interaction
- **packages/core**: Core AI chat functionality and services
- **docs**: Comprehensive documentation
- **integration-tests**: Test suites
- **scripts**: Build and deployment tools

## Target Users
Developers, researchers, and power users who want AI assistance through a command-line interface with advanced authentication and customization options.

## Success Criteria
- Seamless chat experience with Gemini AI
- Reliable authentication flows
- Easy configuration and customization
- Stable cross-platform operation
- Comprehensive documentation and testing
