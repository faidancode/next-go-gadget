"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  phone: string | null | undefined;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
