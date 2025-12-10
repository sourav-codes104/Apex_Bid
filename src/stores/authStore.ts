import { create } from "zustand";
import axios from "@/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadUserFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // LOGIN FUNCTION
  login: async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save token
      localStorage.setItem("token", token);

      // Save user data
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  // LOGOUT FUNCTION
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // LOAD TOKEN & USER ON PAGE REFRESH
  loadUserFromStorage: () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (token && userString) {
      const user = JSON.parse(userString);

      set({
        user,
        token,
        isAuthenticated: true,
      });
    }
  },
}));
