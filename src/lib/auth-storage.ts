type StoredAuth = {
  token: string | null;
  user: string | null;
  invalidated: boolean;
};

function hasWindow() {
  return typeof window !== 'undefined';
}

export function clearStoredAuth() {
  return;
}

export function readStoredAuth(): StoredAuth {
  return { token: null, user: null, invalidated: false };
}

export function persistStoredAuth(token: string, user: string) {
  return;
}

export function getStoredAuthToken() {
  return null;
}

export function getStoredAuthUser() {
  return null;
}
