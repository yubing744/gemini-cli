/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { KeyType } from '@nuwa-ai/identity-kit';

/**
 * Configuration for Nuwa DID authentication
 */
export interface NuwaAuthConfig {
  /** Whether Nuwa DID authentication is enabled */
  enabled: boolean;
  /** CADOP domain URL for authorization */
  cadopDomain?: string;
  /** Local configuration directory path */
  configDir?: string;
  /** Local HTTP callback port for authorization */
  redirectPort?: number;
  /** Cryptographic key type to use */
  keyType?: KeyType;
}

/**
 * Stored configuration for Nuwa DID identity
 */
export interface StoredNuwaConfig {
  /** Agent DID identifier */
  agentDid: string;
  /** Key identifier */
  keyId: string;
  /** Key type used for cryptographic operations */
  keyType: KeyType;
  /** Private key encoded in multibase format */
  privateKeyMultibase: string;
  /** Public key encoded in multibase format */
  publicKeyMultibase: string;
}

/**
 * Result from callback authorization flow
 */
export interface CallbackResult {
  /** Whether authorization was successful */
  success: boolean;
  /** Error message if authorization failed */
  error?: string;
  /** Agent DID if authorization succeeded */
  agentDid?: string;
  /** Key ID if authorization succeeded */
  keyId?: string;
  /** State parameter for CSRF protection */
  state?: string;
}

/**
 * Default configuration values
 */
export const DEFAULT_NUWA_CONFIG = {
  cadopDomain: 'https://test-id.nuwa.dev',
  configDir: '.nuwa',
  redirectPort: 4378,
  keyType: KeyType.ED25519,
} as const;
