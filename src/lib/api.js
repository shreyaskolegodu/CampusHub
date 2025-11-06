const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) return process.env.REACT_APP_API_BASE_URL;
  return '';
};

export async function apiRequest(path, { method = 'GET', headers = {}, body } = {}) {
  const url = `${getBaseUrl()}${path}`;
  const options = {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  };

  const response = await fetch(url, options);
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message = (data && data.message) || response.statusText || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' }),
};


