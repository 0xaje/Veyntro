import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { KeyPair } from 'near-api-js';

// This command only creates a local key. It does not grant any onchain permission.
const directory = join(homedir(), '.near-credentials', 'veyntro-github-verifier');
await mkdir(join(homedir(), '.near-credentials'), { recursive: true, mode: 0o700 });
await mkdir(directory, { mode: 0o700 }); // Stop instead of replacing an existing key.
const secretPath = join(directory, 'restricted-key.txt');
const publicPath = join(directory, 'public-key.txt');
const key = KeyPair.fromRandom('ed25519');
await writeFile(secretPath, key.toString() + '\n', { encoding: 'utf8', mode: 0o600, flag: 'wx' });
await writeFile(publicPath, key.getPublicKey().toString() + '\n', { encoding: 'utf8', mode: 0o600, flag: 'wx' });
console.log(`Public key: ${key.getPublicKey().toString()}`);
console.log(`Private key saved locally at ${secretPath}. Never share it in chat or commit it.`);
