import Cookies from 'js-cookie';

export const TOKEN_KEY = 'admin_token';
export const USER_KEY = 'admin_user';

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
};

export const setUser = (user: any) => {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
};

export const getUser = () => {
  const user = Cookies.get(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!getToken();
};
