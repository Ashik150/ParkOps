const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "parkops_admin_token";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const storeToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const apiRequest = async (
  path,
  { method = "GET", body, signal } = {},
) => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event("parkops:unauthorized"));
    }

    throw new ApiError(
      payload.message || "The request could not be completed.",
      response.status,
      payload.details,
    );
  }

  return payload;
};
