import { useRef, useCallback } from 'react';

export function useRequestGuard() {
  const requestIdRef = useRef(0);
  const userIdRef = useRef<string | null>(null);

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { authService } = await import('../services/auth/auth.service');
      const token = await authService.getToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? payload.userId ?? null;
    } catch {
      return null;
    }
  }, []);

  const nextRequest = useCallback(async () => {
    requestIdRef.current += 1;
    userIdRef.current = await getUserId();
    return { requestId: requestIdRef.current, userId: userIdRef.current };
  }, [getUserId]);

  const isCurrent = useCallback((requestId: number, userId?: string | null) => {
    const sameRequest = requestId === requestIdRef.current;
    const sameSession = !userId || userId === userIdRef.current;
    return sameRequest && sameSession;
  }, []);

  const invalidate = useCallback(() => {
    requestIdRef.current += 1;
  }, []);

  return { nextRequest, isCurrent, invalidate };
}
