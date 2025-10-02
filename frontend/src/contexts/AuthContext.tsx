// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import api from "../lib/api";

// interface User {
//   _id: string;
//   fullName: string;
//   email: string;
//   token: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (fullName: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
//   updateProfile: (data: {
//     fullName: string;
//     email: string;
//     password?: string;
//   }) => Promise<void>;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {

//     const storedUser = localStorage.getItem("user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email: string, password: string) => {
//     const { data } = await api.post("/users/login", { email, password });
//     localStorage.setItem("user", JSON.stringify(data));
//     setUser(data);
//   };

//   const signup = async (fullName: string, email: string, password: string) => {
//     const { data } = await api.post("/users/register", {
//       fullName,
//       email,
//       password,
//     });
//     localStorage.setItem("user", JSON.stringify(data));
//     setUser(data);
//   };

//   const logout = () => {
//     localStorage.removeItem("user");
//     setUser(null);
//   };

//   const updateProfile = async (updateData: {
//     fullName: string;
//     email: string;
//     password?: string;
//   }) => {
//     try {
//       const { data } = await api.put("/users/profile", updateData);
//       localStorage.setItem("user", JSON.stringify(data));
//       setUser(data);
//     } catch (error: any) {
//       const message =
//         error.response?.data?.message || "Failed to update profile.";
//       throw new Error(message);
//     }
//   };

//   const value = {
//     user,
//     login,
//     signup,
//     logout,
//     updateProfile,
//     loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../lib/api";

interface User {
  _id: string;
  fullName: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: {
    fullName: string;
    email: string;
    password?: string;
  }) => Promise<User>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeParse = (v: string | null) => {
  try {
    if (!v) return null;
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const parseJwt = (token?: string | null) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      decodeURIComponent(
        Buffer.from(parts[1], "base64")
          .toString("utf-8")
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      )
    );
    return payload;
  } catch {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  }
};

const isTokenExpired = (token?: string | null) => {
  const payload: any = parseJwt(token);
  if (!payload) return true;
  if (typeof payload.exp !== "number") return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

const setAuthHeader = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common = api.defaults.headers.common || {};
    (api.defaults.headers.common as any).Authorization = `Bearer ${token}`;
  } else {
    if (api.defaults.headers && (api.defaults.headers as any).common) {
      delete (api.defaults.headers as any).common.Authorization;
    } else if ((api.defaults.headers as any).Authorization) {
      delete (api.defaults.headers as any).Authorization;
    }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }
        const stored = safeParse(localStorage.getItem("user"));
        if (stored && typeof stored === "object" && "token" in stored) {
          const token = (stored as any).token as string;
          if (!isTokenExpired(token)) {
            setAuthHeader(token);
            setUser(stored as User);
          } else {
            localStorage.removeItem("user");
            setAuthHeader(null);
            setUser(null);
          }
        } else {
          setAuthHeader(null);
          setUser(null);
        }
      } catch {
        setAuthHeader(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        try {
          const stored = safeParse(e.newValue);
          if (stored && typeof stored === "object" && "token" in stored) {
            const token = (stored as any).token as string;
            if (!isTokenExpired(token)) {
              setAuthHeader(token);
              setUser(stored as User);
              return;
            }
          }
        } catch {}
        setAuthHeader(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/users/login", { email, password });
      const u = (data as User) || null;
      if (!u || !u.token) throw new Error("Invalid login response");
      localStorage.setItem("user", JSON.stringify(u));
      setAuthHeader(u.token);
      setUser(u);
      return u;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      throw new Error(message);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      const { data } = await api.post("/users/register", {
        fullName,
        email,
        password,
      });
      const u = (data as User) || null;
      if (!u || !u.token) throw new Error("Invalid signup response");
      localStorage.setItem("user", JSON.stringify(u));
      setAuthHeader(u.token);
      setUser(u);
      return u;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Signup failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("user");
    } catch {}
    setAuthHeader(null);
    setUser(null);
  };

  const updateProfile = async (updateData: {
    fullName: string;
    email: string;
    password?: string;
  }) => {
    try {
      const { data } = await api.put("/users/profile", updateData);
      const u = (data as User) || null;
      if (!u || !u.token) throw new Error("Invalid profile response");
      localStorage.setItem("user", JSON.stringify(u));
      setAuthHeader(u.token);
      setUser(u);
      return u;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
