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

test('accepts only the latest request response', () => {
  const guard = createRequestGuard();
  const first = guard.nextRequest('user-1');
  const second = guard.nextRequest('user-1');

  assert.ok(guard.isCurrent(second.requestId, second.userId));
  assert.ok(!guard.isCurrent(first.requestId, first.userId));
});

test('rejects response from a different user session', () => {
  const guard = createRequestGuard();
  const userA = guard.nextRequest('user-a');
  guard.nextRequest('user-b');

  assert.ok(!guard.isCurrent(userA.requestId, userA.userId));
});

test('invalidates pending requests on unmount', () => {
  const guard = createRequestGuard();
  const first = guard.nextRequest('user-1');
  guard.invalidate();

  assert.ok(!guard.isCurrent(first.requestId, first.userId));
});
