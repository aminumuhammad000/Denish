export const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const ADMIN_SESSION_EXPIRY_KEY = "admin_session_expiry";

export const clearAdminSession = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
};

export const setAdminSessionExpiry = (timeoutMs = ADMIN_SESSION_TIMEOUT_MS) => {
  const expiryTime = Date.now() + timeoutMs;
  localStorage.setItem(ADMIN_SESSION_EXPIRY_KEY, String(expiryTime));
};

export const resetAdminSessionActivity = (timeoutMs = ADMIN_SESSION_TIMEOUT_MS) => {
  if (!localStorage.getItem("admin_token")) return;
  setAdminSessionExpiry(timeoutMs);
};

export const isAdminSessionExpired = () => {
  const expiryValue = localStorage.getItem(ADMIN_SESSION_EXPIRY_KEY);

  if (!expiryValue) {
    return false;
  }

  const expiryTime = Number(expiryValue);
  if (Number.isNaN(expiryTime)) {
    clearAdminSession();
    return true;
  }

  return Date.now() >= expiryTime;
};
