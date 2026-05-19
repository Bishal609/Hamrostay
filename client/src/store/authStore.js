// client/src/store/authStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi } from "../api/authApi";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(credentials);
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (_) {}
        set({ user: null, accessToken: null });
        localStorage.removeItem("hamrostay-auth");
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      refreshToken: async () => {
        try {
          const res = await authApi.refresh();
          const { accessToken } = res.data.data;
          set({ accessToken });
          return accessToken;
        } catch {
          set({ user: null, accessToken: null });
          return null;
        }
      },

      isAuthenticated: () => !!get().accessToken && !!get().user,
      isAdmin: () => get().user?.role === "ADMIN",
      isVendor: () => get().user?.role === "VENDOR",
      isCustomer: () => get().user?.role === "CUSTOMER",
    }),
    {
      name: "hamrostay-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);

export default useAuthStore;
