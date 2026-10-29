import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApiBaseUrl, resolveDevelopmentApiUrl, resolvePublicApiUrl } from '../src/config/url';

test('resolvePublicApiUrl removes trailing slash', () => {
  assert.equal(resolvePublicApiUrl('http://192.168.3.57:3333/'), 'http://192.168.3.57:3333');
  assert.equal(resolvePublicApiUrl('http://192.168.3.57:3333'), 'http://192.168.3.57:3333');
  assert.equal(resolvePublicApiUrl(undefined), undefined);
});

test('resolveDevelopmentApiUrl returns undefined for localhost', () => {
  assert.equal(resolveDevelopmentApiUrl('http://localhost:8081'), undefined);
  assert.equal(resolveDevelopmentApiUrl('http://127.0.0.1:8081'), undefined);
});

test('resolveDevelopmentApiUrl returns undefined for empty hostUri', () => {
  assert.equal(resolveDevelopmentApiUrl(undefined), undefined);
  assert.equal(resolveDevelopmentApiUrl(''), undefined);
});

test('resolveDevelopmentApiUrl builds LAN URL from valid hostUri', () => {
  assert.equal(resolveDevelopmentApiUrl('192.168.3.57:8081'), 'http://192.168.3.57:3333');
  assert.equal(resolveDevelopmentApiUrl('http://192.168.3.57:8081'), 'http://192.168.3.57:3333');
});

test('buildApiBaseUrl prefers public URL', () => {
  assert.equal(buildApiBaseUrl('http://api.example.com', 'http://dev.example.com'), 'http://api.example.com');
});

test('buildApiBaseUrl falls back to development URL', () => {
  assert.equal(buildApiBaseUrl(undefined, 'http://dev.example.com'), 'http://dev.example.com');
});

test('buildApiBaseUrl throws when no URL is available', () => {
  let error: Error | undefined;
  try {
    buildApiBaseUrl(undefined, undefined);
  } catch (err) {
    error = err instanceof Error ? err : new Error('unknown');
  }
  assert.ok(error, 'expected error when no URL is configured');
  assert.match(error!.message, /URL da API/);
});
