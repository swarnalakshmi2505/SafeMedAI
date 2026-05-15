import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const { access_token, role, full_name, is_verified } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.removeItem('token');
    setToken(access_token);
    setUser({ email, role, full_name, is_verified });

    return response.data;
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
