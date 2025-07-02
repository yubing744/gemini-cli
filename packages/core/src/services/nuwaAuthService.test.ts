/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { NuwaAuthService } from './nuwaAuthService.js';
import { KeyType } from '@nuwa-ai/identity-kit';

// Mock the external dependencies
vi.mock('node:fs/promises');
vi.mock('@nuwa-ai/identity-kit', () => ({
  KeyType: {
    ED25519: 'ed25519',
  },
  LocalSigner: vi.fn().mockImplementation(() => ({
    sign: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
  })),
  generateKeyPair: vi.fn().mockResolvedValue({
    publicKey: new Uint8Array([5, 6, 7, 8]),
    privateKey: new Uint8Array([9, 10, 11, 12]),
  }),
  multibaseEncode: vi.fn().mockImplementation((key) => `encoded_${key.join('_')}`),
  multibaseDecode: vi.fn().mockImplementation((encoded) => 
    new Uint8Array(encoded.replace('encoded_', '').split('_').map(Number))
  ),
}));

describe('NuwaAuthService', () => {
  let service: NuwaAuthService;
  const mockConfig = {
    enabled: true,
    cadopDomain: 'https://test-id.nuwa.dev',
    configDir: '.nuwa-test',
    redirectPort: 4378,
    keyType: KeyType.ED25519,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NuwaAuthService(mockConfig);
  });

  describe('constructor', () => {
    test('should create service with default config merged', () => {
      const minimalConfig = { enabled: true };
      const service = new NuwaAuthService(minimalConfig);
      expect(service).toBeDefined();
    });
  });

  describe('loadOrCreateConfig', () => {
    test('should load existing configuration', async () => {
      const mockStoredConfig = {
        agentDid: 'did:nuwa:test',
        keyId: 'key123',
        keyType: KeyType.ED25519,
        privateKeyMultibase: 'encoded_9_10_11_12',
        publicKeyMultibase: 'encoded_5_6_7_8',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockStoredConfig));

      const result = await service.loadOrCreateConfig();
      expect(result).toEqual(mockStoredConfig);
    });

    test('should create new configuration when none exists', async () => {
      // Mock file not found
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      
      // Mock successful save
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.chmod).mockResolvedValue(undefined);

      // Mock the callback server workflow
      const mockCallbackResult = {
        success: true,
        agentDid: 'did:nuwa:test',
        keyId: 'key123',
        state: 'teststate',
      };

      // Mock the waitForCallback method
      vi.spyOn(service as any, 'waitForCallback').mockResolvedValue(mockCallbackResult);

      const result = await service.loadOrCreateConfig();
      
      expect(result.agentDid).toBe('did:nuwa:test');
      expect(result.keyId).toBe('key123');
      expect(result.keyType).toBe(KeyType.ED25519);
    });
  });

  describe('buildAuthHeader', () => {
    test('should build valid authentication header', async () => {
      const mockStoredConfig = {
        agentDid: 'did:nuwa:test',
        keyId: 'key123',
        keyType: KeyType.ED25519,
        privateKeyMultibase: 'encoded_9_10_11_12',
        publicKeyMultibase: 'encoded_5_6_7_8',
      };

      // Initialize service with stored config
      await service.initialize();
      (service as any).storedConfig = mockStoredConfig;
      (service as any).signer = {
        sign: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
      };

      const payload = { test: 'data' };
      const result = await service.buildAuthHeader(payload);
      
      expect(result).toMatch(/^DID agent_did="did:nuwa:test", key_id="key123", signature="[A-Za-z0-9+/=]+"$/);
    });

    test('should throw error when not initialized', async () => {
      const payload = { test: 'data' };
      
      await expect(service.buildAuthHeader(payload)).rejects.toThrow(
        'Authentication service not initialized'
      );
    });
  });

  describe('getConfigPath', () => {
    test('should return correct config path for relative directory', async () => {
      const configPath = await (service as any).getConfigPath();
      const expectedPath = path.join(os.homedir(), '.nuwa-test', 'nuwa-config.json');
      expect(configPath).toBe(expectedPath);
    });

    test('should return correct config path for absolute directory', async () => {
      const absoluteConfig = {
        ...mockConfig,
        configDir: '/tmp/nuwa-test',
      };
      const absoluteService = new NuwaAuthService(absoluteConfig);
      
      const configPath = await (absoluteService as any).getConfigPath();
      const expectedPath = path.join('/tmp/nuwa-test', 'nuwa-config.json');
      expect(configPath).toBe(expectedPath);
    });
  });

  describe('saveConfig', () => {
    test('should save configuration with correct permissions', async () => {
      const mockConfig = {
        agentDid: 'did:nuwa:test',
        keyId: 'key123',
        keyType: KeyType.ED25519,
        privateKeyMultibase: 'encoded_9_10_11_12',
        publicKeyMultibase: 'encoded_5_6_7_8',
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.chmod).mockResolvedValue(undefined);

      await (service as any).saveConfig(mockConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(mockConfig, null, 2),
        'utf-8'
      );
      expect(fs.chmod).toHaveBeenCalledWith(expect.any(String), 0o600);
    });
  });
});
