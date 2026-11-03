
import Constants from 'expo-constants';
import {
  buildApiBaseUrl,
  resolveDevelopmentApiUrl,
  resolvePublicApiUrl,
} from './config/url';

function getExpoPublicApiUrl(): string | undefined {
  // URL configurada no ambiente Expo/EAS
  const publicUrl = process.env.EXPO_PUBLIC_API_URL;

  if (publicUrl) {
    return publicUrl;
  }

  // Compatibilidade com configurações em extra
  const extra = Constants.expoConfig?.extra;

  if (typeof extra?.EXPO_PUBLIC_API_URL === 'string') {
    return extra.EXPO_PUBLIC_API_URL;
  }

  return undefined;
}

function getExpoDevelopmentHostUri(): string | undefined {
  // Detecta o servidor local apenas em desenvolvimento
  if (!__DEV__) {
    return undefined;
  }

  return Constants.expoConfig?.hostUri;
}

export const config = {
  api: {
    baseUrl: buildApiBaseUrl(
      resolvePublicApiUrl(getExpoPublicApiUrl()),
      resolveDevelopmentApiUrl(getExpoDevelopmentHostUri()),
    ),
  },
};
