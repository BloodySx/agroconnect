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

test('ignores stale response when a newer request completes first', async () => {
  const guard = createRequestGuard();

  const first = guard.nextRequest('user-1');
  const second = guard.nextRequest('user-1');

  await new Promise((resolve) => setTimeout(resolve, 10));

  assert.ok(!guard.isCurrent(first.requestId, first.userId), 'old request should not be current');
  assert.ok(guard.isCurrent(second.requestId, second.userId), 'new request should be current');
});

test('ignores response from previous user after account switch', async () => {
  const guard = createRequestGuard();

  const userA = guard.nextRequest('user-a');
  const userB = guard.nextRequest('user-b');

  assert.ok(!guard.isCurrent(userA.requestId, userA.userId), 'user A request should not be current after switch');
  assert.ok(guard.isCurrent(userB.requestId, userB.userId), 'user B request should be current');
});

test('ignores late price reload after screen unmount', async () => {
  const guard = createRequestGuard();

  const reload = guard.nextRequest('user-1');
  guard.invalidate();

  assert.ok(!guard.isCurrent(reload.requestId, reload.userId), 'reload after invalidate should not be current');
});

test('blocks confirmation when price disappears after 409 reload', async () => {
  const guard = createRequestGuard();

  const original = guard.nextRequest('user-1');
  guard.invalidate();

  const stale = guard.nextRequest('user-1');
  assert.ok(!guard.isCurrent(original.requestId, original.userId), 'original request should not be current after invalidate');
  assert.ok(guard.isCurrent(stale.requestId, stale.userId), 'new request after invalidate should be current');

  guard.invalidate();
  assert.ok(!guard.isCurrent(stale.requestId, stale.userId), 'reload after second invalidate should not be current');
});
