const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.errors ? `: ${data.errors.join(', ')}` : '';
    throw new Error((data.message || 'Request failed') + detail);
  }
  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (p) => request(p, { method: 'PATCH' }),
  del: (p) => request(p, { method: 'DELETE' }),
};

export const qs = (obj) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => v !== '' && v !== undefined && v !== null && p.append(k, v));
  const s = p.toString();
  return s ? `?${s}` : '';
};
