import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'pahala_user';
const USERS_STORAGE_KEY = 'pahala_users';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get stored users
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersData) return false;

    try {
      const users = JSON.parse(usersData);
      const foundUser = users.find(
        (u: { email: string; password: string }) =>
          u.email === email && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }

    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if email already exists
      if (users.some((u: { email: string }) => u.email === userData.email)) {
        return false;
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Auto login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      // Update in users list too
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      if (usersData) {
        const users = JSON.parse(usersData);
        const updatedUsers = users.map((u: User) =>
          u.id === user.id ? { ...u, ...userData } : u
        );
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
