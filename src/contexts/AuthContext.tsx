// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface User {
//   username: string;
//   role: 'user' | 'admin';
// }

// interface AuthContextType {
//   user: User | null;
//   login: (username: string, password: string) => boolean;
//   logout: () => void;
//   isAdmin: () => boolean;
//   isAuthenticated: () => boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     // Check if user is already logged in (from localStorage)
//     const savedUser = localStorage.getItem('user');
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//   }, []);

//   const login = (username: string, password: string): boolean => {
//     // Predefined credentials
//     if (username === 'admin' && password === '1234') {
//       const adminUser: User = { username: 'admin', role: 'admin' };
//       setUser(adminUser);
//       localStorage.setItem('user', JSON.stringify(adminUser));
//       return true;
//     } else if (username && password) {
//       // Any other username/password combination creates a regular user
//       const regularUser: User = { username, role: 'user' };
//       setUser(regularUser);
//       localStorage.setItem('user', JSON.stringify(regularUser));
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   const isAdmin = (): boolean => {
//     return user?.role === 'admin';
//   };

//   const isAuthenticated = (): boolean => {
//     return user !== null;
//   };

//   const value: AuthContextType = {
//     user,
//     login,
//     logout,
//     isAdmin,
//     isAuthenticated,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   // Initialize from localStorage
  //   try {
  //     const savedUser = localStorage.getItem('user');
  //     if (savedUser) {
  //       setUser(JSON.parse(savedUser));
  //     }
  //     // Optional: You can also read token here if needed
  //     // const token = localStorage.getItem('token');
  //   } catch (err) {
  //     console.error('Failed to parse user from localStorage', err);
  //     localStorage.removeItem('user');
  //     localStorage.removeItem('token');
  //   }
  // }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }

        // Call the verify API with the stored token
        const res = await fetch('http://localhost:3001/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Set user from verified token payload or data from the API
          setUser(data.data.user || null);
        } else {
          // Token invalid or expired, clear storage & user state
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    };

    verifyUser();
  }, []);


  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // remove if you're not using cookies
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.data.user);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.data.token);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  // const logout = () => {
  //   setUser(null);
  //   localStorage.removeItem('user');
  //   localStorage.removeItem('token');
  //   // Optionally call backend logout API if you have one
  // };

  const logout = async () => {
    try {
      // Call backend logout endpoint - adjust URL and method as needed
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include Authorization header if required:
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include', // if backend uses cookies for auth
      });
    } catch (error) {
      console.error('Failed to logout from server:', error);
      // You may choose to continue logout client-side even if this fails
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };


  const isAdmin = (): boolean => user?.role === 'admin';

  const isAuthenticated = (): boolean => user !== null;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
