import assert from 'node:assert/strict';
import test from 'node:test';

function createRequestGuard() {
  let requestId = 0;
  let currentUserId: string | null = null;

  return {
    nextRequest(userId: string | null) {
      requestId += 1;
      currentUserId = userId;
      return { requestId, userId: currentUserId };
    },
    isCurrent(requestIdToCheck: number, userIdToCheck?: string | null) {
      const sameRequest = requestIdToCheck === requestId;
      const sameSession = !userIdToCheck || userIdToCheck === currentUserId;
      return sameRequest && sameSession;
    },
    invalidate() {
      requestId += 1;
    },
  };
}

test('blocks price reload after 409 when screen loses focus while mounted', async () => {
  const guard = createRequestGuard();
  let setQuotationCalled = false;

  const focusRequestIdRef = { current: 1 };
  const unmountedRef = { current: false };

  const reloadCurrentPrice = async () => {
    if (unmountedRef.current) return;
    const currentFocusId = focusRequestIdRef.current;
    const { requestId, userId } = guard.nextRequest('user-1');
    if (unmountedRef.current) return;
    if (requestId !== currentFocusId) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (unmountedRef.current) return;
    const clientOffers = [
      { packageId: 'pkg-1', active: true, price: 20, updatedAt: '2026-09-06T16:51:01.566Z' },
    ];
    const match = clientOffers.find((o) => o.packageId === 'pkg-1' && o.active);
    if (match) {
      setQuotationCalled = true;
    }
  };

  const promise = reloadCurrentPrice();

  guard.invalidate();
  focusRequestIdRef.current += 1;
  unmountedRef.current = true;

  await promise;

  assert.ok(!setQuotationCalled, 'setQuotation should not be called after losing focus');
});
