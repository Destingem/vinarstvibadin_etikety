import { describe, expect, it } from 'vitest';
import { getAppwriteSessionUserId } from '../src/server/auth/appwrite-session';

describe('getAppwriteSessionUserId', () => {
  it('returns the direct session userId when present', () => {
    expect(getAppwriteSessionUserId({ userId: 'user_123', $id: 'session_123' })).toBe('user_123');
  });

  it('falls back to nested user.$id when the SDK includes it', () => {
    expect(getAppwriteSessionUserId({ user: { $id: 'user_456' }, $id: 'session_456' })).toBe(
      'user_456',
    );
  });

  it('does not confuse the session id with the user id', () => {
    expect(() => getAppwriteSessionUserId({ $id: 'session_only' })).toThrow(
      'Appwrite session session_only is missing a userId',
    );
  });
});
