import { getToken } from './auth';
import API_BASE from './apiBase';

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await safeError(res));
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await safeError(res));
  return res.json();
}

export async function apiPut(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await safeError(res));
  return res.json();
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await safeError(res));
  return res.json();
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeError(res: Response) {
  try { const d = await res.json(); return d?.error || res.statusText; } catch { return res.statusText; }
}
