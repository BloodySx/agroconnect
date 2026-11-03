const API_PORT = 3333;

export function resolveDevelopmentApiUrl(hostUri: string | undefined): string | undefined {
  if (!hostUri) {
    return undefined;
  }
  try {
    const url = new URL(hostUri.startsWith('http') ? hostUri : `http://${hostUri}`);
    const hostname = url.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      return undefined;
    }
    return `http://${hostname}:${API_PORT}`;
  } catch {
    return undefined;
  }
}

export function resolvePublicApiUrl(explicitUrl: string | undefined): string | undefined {
  if (!explicitUrl) {
    return undefined;
  }
  return explicitUrl.replace(/\/$/, '');
}

export function buildApiBaseUrl(publicUrl: string | undefined, developmentUrl: string | undefined): string {
  if (publicUrl) {
    return publicUrl;
  }
  if (developmentUrl) {
    return developmentUrl;
  }
  throw new Error(
    'Não foi possível determinar a URL da API.\n' +
      'Configure EXPO_PUBLIC_API_URL no ambiente (ex.: .env) para produção.\n' +
      'Em desenvolvimento, execute "npx expo start --lan" para detectar o IP automaticamente.',
  );
}
