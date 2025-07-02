/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as http from 'node:http';
import * as url from 'node:url';
import * as crypto from 'node:crypto';
import {
  KeyType,
  KeyStoreSigner,
  MemoryKeyStore,
  MultibaseCodec,
  CryptoUtils,
} from '@nuwa-ai/identity-kit';
import {
  NuwaAuthConfig,
  StoredNuwaConfig,
  CallbackResult,
  DEFAULT_NUWA_CONFIG,
} from '../config/nuwaAuth.js';

/**
 * Service for managing Nuwa DID authentication
 */
export class NuwaAuthService {
  private config: NuwaAuthConfig;
  private signer?: KeyStoreSigner;
  private storedConfig?: StoredNuwaConfig;

  constructor(config: NuwaAuthConfig) {
    this.config = {
      ...DEFAULT_NUWA_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the authentication service
   */
  async initialize(): Promise<void> {
    try {
      this.storedConfig = await this.loadOrCreateConfig();
      this.signer = this.createLocalSigner(this.storedConfig);
    } catch (error) {
      throw new Error(`Failed to initialize Nuwa auth service: ${error}`);
    }
  }

  /**
   * Load existing configuration or create new one through authorization flow
   */
  async loadOrCreateConfig(): Promise<StoredNuwaConfig> {
    try {
      // Try to load existing configuration
      const existing = await this.loadConfig();
      if (existing) {
        return existing;
      }

      // No existing config, initiate authorization flow
      console.log('[NuwaAuth] No existing configuration found, initiating authorization...');
      return await this.connectToCadop();
    } catch (error) {
      throw new Error(`Failed to load or create configuration: ${error}`);
    }
  }

  /**
   * Connect to CADOP for authorization
   */
  async connectToCadop(): Promise<StoredNuwaConfig> {
    // Generate a new key pair using CryptoUtils
    const keyPair = await CryptoUtils.generateKeyPair(this.config.keyType!);
    const publicKeyMultibase = MultibaseCodec.encode('base58btc', keyPair.publicKey);
    const privateKeyMultibase = MultibaseCodec.encode('base58btc', keyPair.privateKey);

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Build authorization URL
    const authUrl = new URL('/authorization', this.config.cadopDomain);
    authUrl.searchParams.set('public_key', publicKeyMultibase);
    authUrl.searchParams.set('redirect_uri', `http://localhost:${this.config.redirectPort}/callback`);
    authUrl.searchParams.set('state', state);

    console.log(`[NuwaAuth] Opening authorization URL: ${authUrl.toString()}`);
    
    // Open the authorization URL (would typically use 'open' package)
    // For now, just log the URL for manual opening
    console.log(`[NuwaAuth] Please open the following URL in your browser:`);
    console.log(authUrl.toString());

    // Wait for callback
    const callbackResult = await this.waitForCallback(state);
    
    if (!callbackResult.success || !callbackResult.agentDid || !callbackResult.keyId) {
      throw new Error(`Authorization failed: ${callbackResult.error}`);
    }

    // Create and save configuration
    const config: StoredNuwaConfig = {
      agentDid: callbackResult.agentDid,
      keyId: callbackResult.keyId,
      keyType: this.config.keyType!,
      privateKeyMultibase,
      publicKeyMultibase,
    };

    await this.saveConfig(config);
    console.log(`[NuwaAuth] Authorization successful. Agent DID: ${config.agentDid}`);
    
    return config;
  }

  /**
   * Build authentication header for requests
   */
  async buildAuthHeader(payload: unknown): Promise<string> {
    if (!this.signer || !this.storedConfig) {
      throw new Error('Authentication service not initialized');
    }

    try {
      // Create payload for signing
      const signPayload = {
        agentDid: this.storedConfig.agentDid,
        keyId: this.storedConfig.keyId,
        timestamp: Date.now(),
        data: payload,
      };

      // Sign the payload
      const signature = await this.signer.sign(JSON.stringify(signPayload));
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Create authorization header
      const authHeader = `DID agent_did="${this.storedConfig.agentDid}", key_id="${this.storedConfig.keyId}", signature="${signatureBase64}"`;
      
      return authHeader;
    } catch (error) {
      throw new Error(`Failed to build auth header: ${error}`);
    }
  }

  /**
   * Create a local signer from stored configuration
   */
  private createLocalSigner(config: StoredNuwaConfig): KeyStoreSigner {
    const codec = new MultibaseCodec();
    const privateKey = codec.decode(config.privateKeyMultibase);
    const keyStore = new MemoryKeyStore();
    return new KeyStoreSigner(keyStore, config.keyType);
  }

  /**
   * Wait for authorization callback
   */
  private async waitForCallback(expectedState: string): Promise<CallbackResult> {
    return new Promise((resolve) => {
      const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url || '', true);
        
        if (parsedUrl.pathname === '/callback') {
          const query = parsedUrl.query;
          
          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'text/html');
          
          if (query.error) {
            res.writeHead(400);
            res.end(`<html><body><h1>Authorization Failed</h1><p>${query.error}</p></body></html>`);
            server.close();
            resolve({
              success: false,
              error: query.error as string,
            });
            return;
          }
          
          if (query.state !== expectedState) {
            res.writeHead(400);
            res.end('<html><body><h1>Authorization Failed</h1><p>Invalid state parameter</p></body></html>');
            server.close();
            resolve({
              success: false,
              error: 'Invalid state parameter',
            });
            return;
          }
          
          if (!query.agent_did || !query.key_id) {
            res.writeHead(400);
            res.end('<html><body><h1>Authorization Failed</h1><p>Missing required parameters</p></body></html>');
            server.close();
            resolve({
              success: false,
              error: 'Missing required parameters',
            });
            return;
          }
          
          // Success
          res.writeHead(200);
          res.end('<html><body><h1>Authorization Successful</h1><p>You can close this window.</p></body></html>');
          server.close();
          
          resolve({
            success: true,
            agentDid: query.agent_did as string,
            keyId: query.key_id as string,
            state: query.state as string,
          });
        } else {
          res.writeHead(404);
          res.end('<html><body><h1>Not Found</h1></body></html>');
        }
      });
      
      server.listen(this.config.redirectPort, 'localhost', () => {
        console.log(`[NuwaAuth] Callback server listening on http://localhost:${this.config.redirectPort}`);
      });
      
      // Set a timeout for the authorization flow
      setTimeout(() => {
        server.close();
        resolve({
          success: false,
          error: 'Authorization timeout',
        });
      }, 5 * 60 * 1000); // 5 minutes timeout
    });
  }

  /**
   * Load configuration from file system
   */
  private async loadConfig(): Promise<StoredNuwaConfig | null> {
    try {
      const configPath = await this.getConfigPath();
      const configData = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(configData) as StoredNuwaConfig;
    } catch (error) {
      // Config file doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Save configuration to file system
   */
  private async saveConfig(config: StoredNuwaConfig): Promise<void> {
    try {
      const configPath = await this.getConfigPath();
      const configDir = path.dirname(configPath);
      
      // Ensure config directory exists
      await fs.mkdir(configDir, { recursive: true });
      
      // Save configuration
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
      
      // Set appropriate permissions (readable only by owner)
      await fs.chmod(configPath, 0o600);
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error}`);
    }
  }

  /**
   * Get the configuration file path
   */
  private async getConfigPath(): Promise<string> {
    const configDir = this.config.configDir?.startsWith('/')
      ? this.config.configDir
      : path.join(os.homedir(), this.config.configDir!);
    
    return path.join(configDir, 'nuwa-config.json');
  }
}
