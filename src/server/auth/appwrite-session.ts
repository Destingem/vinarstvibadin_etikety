type AppwriteLoginSession = {
  userId?: unknown;
  $id?: unknown;
  user?: {
    $id?: unknown;
  } | null;
};

function normalizeIdentifier(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

export function getAppwriteSessionUserId(session: AppwriteLoginSession) {
  const userId =
    normalizeIdentifier(session.userId) ??
    normalizeIdentifier(session.user?.$id);

  if (userId) {
    return userId;
  }

  const sessionId = normalizeIdentifier(session.$id);
  if (sessionId) {
    throw new Error(`Appwrite session ${sessionId} is missing a userId`);
  }

  throw new Error('Appwrite session is missing a userId');
}
