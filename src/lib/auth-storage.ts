import { getAuthContextFingerprint } from '@/lib/appwrite-env';

const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_USER_KEY = 'user';
const AUTH_CONTEXT_KEY = 'auth-context-fingerprint';

type StoredAuth = {
  token: string | null;
  user: string | null;
  invalidated: boolean;
};

function hasWindow() {
  return typeof window !== 'undefined';
}

export function clearStoredAuth() {
  if (!hasWindow()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_CONTEXT_KEY);
}

export function readStoredAuth(): StoredAuth {
  if (!hasWindow()) {
    return { token: null, user: null, invalidated: false };
  }

  const currentContext = getAuthContextFingerprint();
  const storedContext = localStorage.getItem(AUTH_CONTEXT_KEY);

  if (storedContext && storedContext !== currentContext) {
    clearStoredAuth();
    return { token: null, user: null, invalidated: true };
  }

  return {
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    user: localStorage.getItem(AUTH_USER_KEY),
    invalidated: false,
  };
}

export function persistStoredAuth(token: string, user: string) {
  if (!hasWindow()) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, user);
  localStorage.setItem(AUTH_CONTEXT_KEY, getAuthContextFingerprint());
}

export function getStoredAuthToken() {
  return readStoredAuth().token;
}

export function getStoredAuthUser() {
  return readStoredAuth().user;
}
