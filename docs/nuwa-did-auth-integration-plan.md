# Nuwa DID 认证机制集成实施计划

## 1. 设计原则

- **最小侵入性**：通过环境变量控制，不影响现有功能
- **模块化设计**：认证逻辑独立封装，便于维护和测试
- **兼容性优先**：保持现有 MCP 客户端 API 不变
- **渐进式集成**：可选功能，支持平滑回退

---

## 2. 依赖管理

- 在 `packages/core/package.json` 增加依赖：
  ```json
  "@nuwa-ai/identity-kit": "^0.1.0"
  ```

---

## 3. 配置与类型扩展

- 新增 `NuwaAuthConfig`、`StoredNuwaConfig` 类型到 `packages/core/src/config/nuwaAuth.ts`
- 扩展 `MCPServerConfig` 支持 nuwaAuth 字段

---

## 4. 认证服务与身份管理

- 新建 `packages/core/src/services/nuwaAuthService.ts`，实现：
  - 本地密钥生成/持久化
  - deep-link 授权流程
  - 签名器实现
  - Authorization header 构造
- 新建 `packages/core/src/auth/nuwaIdentity.ts`，实现密钥管理与 deep-link 授权细节

---

## 5. MCP 客户端集成

- 在 `packages/core/src/tools/mcp-client.ts`：
  - 检测 `process.env.NUWA_DID_AUTH` 或 mcpServerConfig.nuwaAuth?.enabled
  - 若启用，调用 NuwaAuthService 生成 Authorization header，注入到 HTTP 请求
  - 认证失败时自动回退到无认证连接

---

## 6. 配置与环境变量

- 支持环境变量：
  - `NUWA_DID_AUTH=true`
  - `NUWA_CADOP_DOMAIN=https://test-id.nuwa.dev`
  - `NUWA_CONFIG_DIR=~/.nuwa`
  - `NUWA_REDIRECT_PORT=4378`
- 支持 mcpServers 配置文件扩展

---

## 7. 测试计划

### 7.1 单元测试

- `packages/core/src/services/nuwaAuthService.test.ts`
  - 初始化、密钥生成、header 构造、异常处理等

### 7.2 集成测试

- `integration-tests/nuwa-auth.test.js`
  - 启用/禁用认证、回退机制、环境变量优先级、多服务器混合配置等

### 7.3 模拟测试环境

- Mock CADOP 服务器、MCP 服务器、网络异常等

---

## 8. 部署与回滚

- 认证失败不影响核心功能
- 配置向后兼容
- 依赖隔离，仅在启用时加载
- 详细日志输出

---

## 9. 实施里程碑

1. 依赖添加 + 基础架构
2. MCP 客户端集成
3. 配置与测试
4. 部署验证与文档

---

如需详细代码实现，请参考本计划逐步推进。所有关键接口、配置、测试点均已明确，便于团队协作和 AI Agent 自动化实施。
