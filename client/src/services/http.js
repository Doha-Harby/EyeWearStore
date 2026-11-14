import axios from 'axios';

/**
 * One shared Axios instance. `withCredentials` lets the browser send our HttpOnly auth cookies.
 * Phase 3 will add the "refresh the access token on 401, then retry" interceptor here.
 */
export const http = axios.create({ baseURL: '/api', withCredentials: true, timeout: 15000 });

const normalize = (error) => {
  const data = error.response?.data;
  return {
    status: error.response?.status ?? 0,
    message:
      data?.message ??
      (error.code === 'ECONNABORTED' ? 'The request timed out' : 'Cannot reach the server'),
    errors: data?.errors ?? {},
  };
};

// Silent session renewal: when the 15-minute access cookie expires the API answers 401. We ask
// /auth/refresh for a new one (the refresh cookie is sent automatically) and retry the original
// request once. `refreshing` is shared so several parallel 401s trigger only ONE refresh call,
// which matters because refresh tokens are single-use.
let refreshing = null;
const NO_RETRY = ['/auth/refresh', '/auth/login', '/auth/register'];

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && config && !config._retry && !NO_RETRY.includes(config.url)) {
      config._retry = true;
      try {
        refreshing ??= http.post('/auth/refresh').finally(() => (refreshing = null));
        await refreshing;
        return http(config);
      } catch {
        /* refresh failed: fall through and report the original 401 */
      }
    }
    return Promise.reject(normalize(error));
  },
);
